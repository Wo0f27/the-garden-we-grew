"""Actual Chromium browser smoke/regression test; isolated, no production data."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os, threading, tempfile, json, struct
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get("GARDEN_QA_OUTPUT", tempfile.mkdtemp(prefix="garden-qa-")))
OUT.mkdir(parents=True, exist_ok=True)
KEY = "the-garden-we-grew-prototype-v1"
SPECIES = ["rose","peony","tulip","daisy","sunflower","gypsophila"]
class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = ThreadingHTTPServer(("127.0.0.1",0),partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url = "http://127.0.0.1:%s/" % server.server_port
def saved(page):
    return page.evaluate("(key)=>JSON.parse(localStorage.getItem(key))", KEY)
def fit(page):
    sizes=page.evaluate("({view:document.documentElement.clientWidth,content:document.documentElement.scrollWidth})")
    assert sizes["content"] <= sizes["view"]+1, sizes
def click(page, selector):
    page.locator(selector).click()
def plant(page, id, count=4):
    click(page, f'#plants button[data-id="{id}"][data-action="plant"]')
    for _ in range(count): click(page, f'#plants button[data-id="{id}"][data-action="water"]')
def journey(browser,name,width,height,mobile=False,reduce="reduce"):
    context=browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,has_touch=mobile,device_scale_factor=1,reduced_motion=reduce,accept_downloads=True)
    page=context.new_page()
    errors=[]; requests=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.on("request",lambda req:requests.append(req.url))
    page.goto(url,wait_until="networkidle")
    expect(page.locator("#app")).to_be_visible()
    fit(page)
    assert page.locator("html").evaluate("(el)=>el.classList.contains('stable-art')")==mobile
    assert page.locator("body").evaluate("(el)=>getComputedStyle(el, '::before').backgroundImage")== "none"
    assert page.locator("svg filter").count()==0
    page.screenshot(path=str(OUT/(name+"-entrance.png")))
    click(page,"#openGate")
    expect(page.locator("#gardenJourney")).to_be_visible()
    assert page.locator("#gardenJourney").evaluate("(el)=>getComputedStyle(el).animationName")== "none"
    if reduce=="no-preference":
        expect(page.locator("#butterflyEffects .ambient-butterfly")).to_have_count(3)
        page.wait_for_timeout(750)
    expect(page.locator("#openLetter")).to_be_disabled()
    for id in SPECIES: plant(page,id)
    if mobile:
        expect(page.locator("#plants .plant-art img")).to_have_count(6)
        page.wait_for_function("Array.from(document.querySelectorAll('#plants .plant-art img')).every(i=>i.complete&&i.naturalWidth>0)")
        assert page.locator("#plants .plant-art svg").count()==0
    if reduce=="no-preference": page.wait_for_timeout(1000)
    expect(page.locator("#notice")).to_be_empty(timeout=6000)
    assert page.locator("#plants .plant-card").evaluate_all("""cards=>cards.every(card=>{const art=card.querySelector(".plant-art").getBoundingClientRect(),svg=card.querySelector(".plant-art svg,.plant-art img").getBoundingClientRect(),name=card.querySelector("h3").getBoundingClientRect();return svg.bottom<=art.bottom+1&&svg.top>=art.top-1&&art.bottom<=name.top+1})"""), "nursery illustration overlaps heading"
    page.locator("#gardenPath .scene-picture").screenshot(path=str(OUT/(name+"-path.png")),animations="disabled")
    page.locator("#plants").screenshot(path=str(OUT/(name+"-nursery.png")),animations="disabled")
    expect(page.locator("#openLetter")).to_be_enabled()
    assert page.locator("#progress").evaluate("(el)=>el.value")==6
    fit(page)
    for id in SPECIES: click(page,f'#flowerTray button[data-id="{id}"]')
    assert len(saved(page)["bouquet"])==6
    click(page,"#editPosition")
    expect(page.locator("#bouquetArt .flower-handle")).to_have_count(6)
    page.locator("#positionFlower").select_option("rose")
    click(page,"#tiltRight")
    original=saved(page)["placements"]["rose"]
    click(page,"#undoBouquet")
    assert "rose" not in saved(page)["placements"]
    click(page,"#redoBouquet")
    assert saved(page)["placements"]["rose"]==original
    click(page,"#autoArrange")
    assert not saved(page)["placements"]
    # A genuine browser pointer sequence. Desktop mouse and mobile touch via CDP.
    handle=page.locator('#bouquetArt [data-handle="rose"] .handle-ring')
    handle.scroll_into_view_if_needed()
    box=handle.bounding_box(); assert box
    x,y=box["x"]+box["width"]/2,box["y"]+box["height"]/2
    if mobile:
        cdp=context.new_cdp_session(page)
        cdp.send("Input.dispatchTouchEvent",{"type":"touchStart","touchPoints":[{"x":x,"y":y}]})
        for i in range(1,6): cdp.send("Input.dispatchTouchEvent",{"type":"touchMove","touchPoints":[{"x":x+5*i,"y":y-3*i}]})
        cdp.send("Input.dispatchTouchEvent",{"type":"touchEnd","touchPoints":[]})
    else:
        page.mouse.move(x,y); page.mouse.down(); page.mouse.move(x+30,y-20,steps=6); page.mouse.up()
    assert "rose" in saved(page)["placements"], "pointer move did not commit"
    click(page,"#editPosition")
    page.locator("#paperStyle").select_option("botanical")
    page.locator("#ribbonStyle").select_option("long")
    click(page,"#wrapBouquet")
    assert saved(page)["wrapped"]
    expect(page.locator("#editPosition")).to_be_disabled()
    page.locator("#bouquetArt").screenshot(path=str(OUT/(name+"-bouquet.png")),animations="disabled")
    with page.expect_download() as dl: click(page,"#svg")
    svg_file=OUT/(name+".svg"); dl.value.save_as(str(svg_file))
    svg=svg_file.read_text()
    assert "<svg" in svg and "wrap-tie" in svg and "position-handles" not in svg
    with page.expect_download() as dl: click(page,"#png")
    png_file=OUT/(name+".png"); dl.value.save_as(str(png_file))
    png=png_file.read_bytes()
    assert png[:8]==b"\x89PNG\r\n\x1a\n"
    assert struct.unpack(">II",png[16:24])==(1200,1320)
    snapshot=saved(page)
    click(page,"#openLetter")
    expect(page.locator("#gardenLetter")).to_be_visible()
    expect(page.locator("#notice")).to_be_empty()
    page.locator("#gardenLetter").screenshot(path=str(OUT/(name+"-letter.png")),animations="disabled")
    click(page,"#closeLetter")
    expect(page.locator("#gardenLetter")).to_be_hidden()
    page.reload(wait_until="networkidle");click(page,"#openGate")
    assert saved(page)==snapshot
    expect(page.locator("#openLetter")).to_be_enabled()
    expect(page.locator("#undoBouquet")).to_be_disabled()
    fit(page)
    page.once("dialog",lambda d:d.accept());click(page,"#reset")
    assert saved(page)["plants"]=={} and saved(page)["bouquet"]==[]
    expect(page.locator("#openLetter")).to_be_disabled()
    fit(page)
    if reduce=="no-preference":
        # A changed configuration response is loaded fresh after reload; no repository mutation.
        old_url=next(u for u in reversed(requests) if "garden-text.js?v=" in u)
        def fresh(route):
            response=route.fetch()
            route.fulfill(response=response,body=response.text()+"\nwindow.GARDEN_TEXT.title = \"QA fresh title\";\n")
        page.route("**/garden-text.js?v=*",fresh)
        page.wait_for_timeout(20)
        page.reload(wait_until="networkidle")
        expect(page.locator("h1")).to_have_text("QA fresh title")
        new_url=next(u for u in reversed(requests) if "garden-text.js?v=" in u)
        assert old_url!=new_url, "stale text URL"
        assert saved(page)["plants"]=={}
    assert not errors,errors
    assert all(u.startswith(url) or u.startswith(("blob:","data:")) for u in requests),requests
    print(json.dumps({"profile":name,"viewport":[width,height],"journey":"PASS","png_bytes":len(png),"svg_bytes":len(svg.encode()),"page_errors":len(errors),"external_requests":0}),flush=True)
    context.close()
try:
    with sync_playwright() as p:
        chrome=os.environ.get("GARDEN_QA_CHROME")
        browser=p.chromium.launch(headless=True, **({"executable_path":chrome} if chrome else {}))
        for name,w,h,mobile in [("desktop",1280,900,False),("mobile",390,844,True),("narrow",320,740,True)]:
            journey(browser,name,w,h,mobile)
        journey(browser,"normal-motion",390,844,True,"no-preference")
        journey(browser,"desktop-normal-motion",1280,900,False,"no-preference")
        browser.close()
    print("Browser QA PASS; screenshots and exports:",OUT,flush=True)
finally:
    server.shutdown();server.server_close()
