"""Actual Chromium browser smoke/regression test; isolated, no production data."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os, threading, tempfile, json, struct, base64
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get("GARDEN_QA_OUTPUT", tempfile.mkdtemp(prefix="garden-qa-")))
OUT.mkdir(parents=True, exist_ok=True)
KEY = "the-garden-we-grew-v9-preview"
LEGACY_KEY = "the-garden-we-grew-prototype-v1"
PEACH_GIF = "https://media.tenor.com/ZQ7fGn4s3YwAAAAj/peach-goma-paw-paw.gif"
PEACH_FIXTURE = base64.b64decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")
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
    assert page.evaluate("()=>document.scrollingElement.scrollHeight <= document.scrollingElement.clientHeight + 1"), "document has vertical overflow"
    page.evaluate("window.scrollTo(0,document.body.scrollHeight+1000)")
    assert page.evaluate("window.scrollY")==0, "document scroll position changed"
def click(page, selector):
    page.locator(selector).click()
SCENES = ["gardenPath","nursery","glassEntrance","greenhouse","finalGarden"]
def only_scene(page,id):
    expect(page.locator("#"+id)).to_be_visible()
    for other in SCENES:
        if other != id: expect(page.locator("#"+other)).to_be_hidden()
    assert page.evaluate("window.scrollY")==0, "chapter navigation scrolled the document"
    if id in ("gardenPath","glassEntrance"):
        assert page.locator("#"+id).evaluate("el=>el.scrollHeight<=el.clientHeight+1"), "scenic chapter has overflow"
        expect(page.locator("#"+id+" .scene-caption")).to_be_in_viewport()
    if id!="finalGarden": expect(page.locator("#gardenClosing")).to_be_hidden()
def go(page,source,destination):
    click(page, f'#{source} [data-scene-go="{destination}"]')
    only_scene(page,destination)
    expect(page.locator("#petalTransition")).to_be_hidden()
    assert not page.locator("#app").evaluate("el=>el.inert"), "transition left app inert"
def plant(page, id, count=4):
    click(page, f'#plants button[data-id="{id}"][data-action="plant"]')
    for _ in range(count): click(page, f'#plants button[data-id="{id}"][data-action="water"]')
def journey(browser,name,width,height,mobile=False,reduce="reduce"):
    context=browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,has_touch=mobile,device_scale_factor=1,reduced_motion=reduce,accept_downloads=True)
    page=context.new_page()
    errors=[]; requests=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.on("request",lambda req:requests.append(req.url))
    # Isolate the single intentional sticker request; this does not verify the CDN animation.
    page.route(PEACH_GIF,lambda route:route.fulfill(status=200,content_type="image/gif",body=PEACH_FIXTURE))
    page.goto(url,wait_until="networkidle")
    expect(page.locator("#app")).to_be_visible()
    expect(page.locator(".edition")).to_have_count(0)
    expect(page.locator("#app footer")).to_have_count(0)
    assert page.locator(".navbar-brand").evaluate("el=>{const r=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();return Math.abs((r.left+r.right)-(p.left+p.right))<=2}"), "navbar title not centered"
    expect(page.locator("#reset")).to_be_enabled()
    fit(page)
    page.screenshot(path=str(OUT/(name+"-entrance.png")))
    # Capture the destination viewBox at the instant the journey becomes visible.
    page.evaluate("""()=>{window.qaArrivalWidth=null;const journey=document.querySelector("#gardenJourney");new MutationObserver((changes,observer)=>{if(!journey.hidden){window.qaArrivalWidth=document.querySelector("#pathCamera").viewBox.baseVal.width;observer.disconnect()}}).observe(journey,{attributes:true,attributeFilter:["hidden"]})}""")
    click(page,"#openGate")
    if reduce=="no-preference":
        expect(page.locator("#openGate")).to_have_attribute("aria-disabled","true")
        expect(page.locator("#gardenJourney")).to_be_hidden()
        page.wait_for_function("""()=>{const w=document.querySelector("#gateCamera").viewBox.baseVal.width;return w<310&&w>110}""")
        expect(page.locator("#gardenJourney")).to_be_hidden()
        page.locator("#gateCamera").screenshot(path=str(OUT/(name+"-gate-zoom.png")))
        page.evaluate("document.querySelector('#openGate').click()")
    expect(page.locator("#gardenJourney")).to_be_visible()
    if reduce=="no-preference":
        assert 165 < page.evaluate("window.qaArrivalWidth") < 168, "destination did not arrive zoomed in"
        page.wait_for_function("""()=>{const w=document.querySelector("#pathCamera").viewBox.baseVal.width;return w>210&&w<550}""")
        expect(page.locator("#openGate")).to_have_attribute("aria-disabled","true")
        page.locator("#pathCamera").screenshot(path=str(OUT/(name+"-path-pullback.png")))
        page.evaluate("document.querySelector('#openGate').click()")
    else:
        assert page.evaluate("window.qaArrivalWidth")==600, "reduced-motion arrival zoomed"
    expect(page.locator("#pathCamera")).to_have_attribute("viewBox","0 0 600 320")
    expect(page.locator("#openGate")).not_to_have_attribute("aria-disabled","true")
    expect(page.locator("#openGate")).to_have_attribute("aria-expanded","true")
    expect(page.locator("#gateCamera")).to_have_attribute("viewBox","0 0 360 330")
    only_scene(page,"gardenPath")
    expect(page.locator("#gateIntro")).to_be_hidden()
    expect(page.locator("#distantGreenhouse")).to_be_visible()
    page.evaluate("window.scrollTo(0,document.body.scrollHeight+1000)")
    assert page.evaluate("window.scrollY")==0
    only_scene(page,"gardenPath")
    page.locator("#gardenPath .scene-picture").screenshot(path=str(OUT/(name+"-path.png")),animations="disabled")
    if reduce=="no-preference": expect(page.locator("#butterflyEffects .ambient-butterfly")).to_have_count(3)
    if reduce=="no-preference":
        # Observe the precise handoff, including opacity and the input lock.
        page.evaluate("""()=>{window.qaPetalHandoff=null;const dest=document.querySelector("#nursery");new MutationObserver((_,observer)=>{if(!dest.hidden){const overlay=document.querySelector("#petalTransition");window.qaPetalHandoff={phase:overlay.dataset.phase,opacity:getComputedStyle(overlay.querySelector(".petal-veil")).opacity,locked:document.querySelector("#app").inert,oldHidden:document.querySelector("#gardenPath").hidden};observer.disconnect()}}).observe(dest,{attributes:true,attributeFilter:["hidden"]})}""")
        click(page,'#gardenPath [data-scene-go="nursery"]')
        expect(page.locator("#petalTransition")).to_have_attribute("data-phase","covering")
        expect(page.locator("#transitionPetals .transition-petal")).to_have_count(36)
        page.evaluate("""()=>document.querySelector('#gardenPath [data-scene-go="nursery"]').click()""")
        page.wait_for_function("()=>window.qaPetalHandoff!==null")
        assert page.evaluate("window.qaPetalHandoff")=={"phase":"covered","opacity":"1","locked":True,"oldHidden":True}
        only_scene(page,"nursery")
        expect(page.locator("#petalTransition")).to_be_hidden()
        assert not page.locator("#app").evaluate("el=>el.inert")
        # Interrupt a return transition, then restore normal motion and continue.
        click(page,'#nursery [data-scene-go="gardenPath"]')
        expect(page.locator("#petalTransition")).to_have_attribute("data-phase","covering")
        page.emulate_media(reduced_motion="reduce")
        only_scene(page,"gardenPath")
        expect(page.locator("#petalTransition")).to_be_hidden()
        assert not page.locator("#app").evaluate("el=>el.inert")
        page.emulate_media(reduced_motion="no-preference")
        go(page,"gardenPath","nursery")
    else:
        go(page,"gardenPath","nursery")
        expect(page.locator("#transitionPetals .transition-petal")).to_have_count(0)
    expect(page.locator("#peachNursery")).to_be_visible()
    expect(page.locator("#peachSticker")).to_have_attribute("src",PEACH_GIF)
    if reduce=="no-preference":
        page.locator("#peachSticker").scroll_into_view_if_needed()
        page.wait_for_function("()=>document.querySelector('#peachSticker').naturalWidth>0")
    else:
        expect(page.locator(".nursery-peach")).to_be_hidden()
    expect(page.locator("#visitGreenhouse")).to_have_attribute("href","#glassEntrance")
    assert page.locator("#peachNursery").evaluate('el=>el.previousElementSibling.id==="plants"&&el.closest("#nursery")!==null')
    go(page,"nursery","glassEntrance")
    expect(page.locator("#glassEntrance")).to_be_in_viewport()
    expect(page.locator("#peachGlassGuide")).to_be_visible()
    expect(page.locator("#glassPeachSticker")).to_have_attribute("src",PEACH_GIF)
    expect(page.locator("#glassEntrance .scene-caption [data-scene-go=\"greenhouse\"]")).to_have_count(0)
    expect(page.locator("#glassDoor")).to_be_visible()
    expect(page.locator("#glassEntrance .scene-caption [data-scene-go=\"nursery\"]")).to_be_visible()
    go(page,"glassEntrance","nursery")
    assert page.locator("#distantGreenhouse").evaluate("""el=>{const p=new DOMPoint(300,241).matrixTransform(el.transform.baseVal.consolidate().matrix);return Math.abs(p.x-348)<.01&&Math.abs(p.y-172)<.01}"""), "greenhouse threshold does not meet path endpoint"
    assert page.locator("#gardenJourney").evaluate("(el)=>getComputedStyle(el).animationName")=="none"
    fit(page)
    if reduce=="no-preference":
        expect(page.locator("#butterflyEffects .ambient-butterfly")).to_have_count(3)
        page.wait_for_timeout(750)
    expect(page.locator("#openLetter")).to_be_disabled()
    for id in SPECIES: plant(page,id)
    expect(page.locator("#plants .plant-card")).to_have_count(18)
    expect(page.locator("#extraProgress")).to_have_text("Extended nursery: 0 of 12 flowers in bloom")
    if reduce=="no-preference": page.wait_for_timeout(1000)
    expect(page.locator("#notice")).to_be_empty(timeout=6000)
    assert page.locator("#plants .plant-card").evaluate_all("""cards=>cards.every(card=>{const art=card.querySelector(".plant-art").getBoundingClientRect(),svg=card.querySelector(".plant-art svg").getBoundingClientRect(),name=card.querySelector("h3").getBoundingClientRect();return svg.bottom<=art.bottom+1&&svg.top>=art.top-1&&art.bottom<=name.top+1})"""), "nursery illustration overlaps heading"
    page.locator("#plants").screenshot(path=str(OUT/(name+"-nursery.png")),animations="disabled")
    expect(page.locator("#openLetter")).to_be_enabled()
    assert page.locator("#progress").evaluate("(el)=>el.value")==6
    fit(page)
    go(page,"nursery","glassEntrance")
    if reduce=="no-preference":
        click(page,"#glassDoor")
        expect(page.locator("#glassEntrance")).to_have_class(__import__("re").compile("glass-door-opening"))
        expect(page.locator("#greenhouse")).to_be_hidden()
        expect(page.locator("#petalTransition")).to_be_hidden()
        expect(page.locator("#petalTransition")).to_be_visible()
        only_scene(page,"greenhouse")
        expect(page.locator("#petalTransition")).to_be_hidden()
        assert not page.locator("#app").evaluate("el=>el.inert")
    else:
        page.locator("#glassDoor").focus()
        page.keyboard.press("Enter")
        only_scene(page,"greenhouse")
        expect(page.locator("#petalTransition")).to_be_hidden()
    expect(page.locator("#arrangement")).to_have_count(0)
    expect(page.locator(".florist-room #bouquetArt")).to_be_visible()
    for id in SPECIES: click(page,f'#flowerTray button[data-id="{id}"][data-action="add"]')
    assert len(saved(page)["bouquet"])==6
    original_order=saved(page)["bouquet"]
    click(page,"#bouquetHelp")
    expect(page.locator("#helpDialog")).to_be_visible()
    click(page,"#closeHelp")
    expect(page.locator("#helpDialog")).to_be_hidden()
    click(page,'#flowerTray button[data-id="rose"][data-action="add"]')
    assert saved(page)["bouquet"][-1]=="rose~2"
    expect(page.locator('#bouquetArt [data-flower="rose~2"]')).to_have_count(1)
    click(page,'#flowerTray button[data-id="rose~2"][data-action="remove"]')
    assert saved(page)["bouquet"]==original_order
    click(page,'#flowerTray button[data-id="rose"][data-action="down"]')
    assert saved(page)["bouquet"][:2]==[original_order[1],"rose"]
    assert page.locator("#flowerTray .tray-selected").evaluate_all("els=>els.map(e=>e.dataset.flower)")==saved(page)["bouquet"]
    click(page,'#flowerTray button[data-id="rose"][data-action="up"]')
    assert saved(page)["bouquet"]==original_order
    click(page,'#flowerTray button[data-id="rose"][data-action="remove"]')
    assert "rose" not in saved(page)["bouquet"]
    click(page,"#undoBouquet")
    assert saved(page)["bouquet"]==original_order
    expect(page.locator("#bouquetArt [data-flower]")).to_have_count(6)
    page.locator(".live-workbench").screenshot(path=str(OUT/(name+"-workbench.png")),animations="disabled")
    # Scroll controls past the pin threshold and confirm the preview masks the whole width.
    if height>520:
        page.locator("#greenhouse").evaluate("""el=>{const p=el.querySelector(".live-workbench");el.scrollTop+=p.getBoundingClientRect().top-el.getBoundingClientRect().top+100}""")
        page.wait_for_timeout(450)
        assert page.locator("#greenhouse").evaluate("""el=>{const p=el.querySelector(".live-workbench"),r=el.getBoundingClientRect(),b=p.getBoundingClientRect(),bg=getComputedStyle(p).backgroundColor;const hit=(x,y)=>p.contains(document.elementFromPoint(x,y));return el.scrollTop>0&&Math.abs(b.top-r.top-el.clientTop)<=2&&Math.abs(b.left-r.left-el.clientLeft)<=1&&Math.abs(b.width-el.clientWidth)<=1&&bg==="rgb(245, 237, 222)"&&hit(b.left+1,b.top+1)&&hit(b.right-2,b.top+1)}"""), "sticky preview leaves an exposed scrolling gap"
        page.locator("#greenhouse").screenshot(path=str(OUT/(name+"-workbench-pinned.png")),animations="disabled")
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
    page.wait_for_timeout(450)
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
    page.locator("#wrap").select_option("blush")
    page.locator("#paperStyle").select_option("botanical")
    page.locator("#ribbonStyle").select_option("long")
    assert not saved(page)["wrapped"]
    expect(page.locator("#paperPreviewStatus")).to_be_visible()
    expect(page.locator("#bouquetArt .wrap-left")).to_be_visible()
    click(page,"#wrapBouquet")
    assert saved(page)["wrapped"]
    expect(page.locator("#paperPreviewStatus")).to_be_hidden()
    for layer in ("wrap-back","wrap-left","wrap-right","wrap-tie"):
        part=page.locator("#bouquetArt ."+layer)
        expect(part).to_be_visible()
        assert part.evaluate("""el=>{const b=el.getBoundingClientRect(),s=getComputedStyle(el);return b.width>3&&b.height>3&&s.opacity==="1"&&s.animationName==="none"}"""),layer
    assert page.locator("#bouquetArt .wrap-left path").first.get_attribute("fill")=="#e3b6bd"
    expect(page.locator("#bouquetArt #paperPattern")).to_have_count(1)
    click(page,"#wrapBouquet")
    expect(page.locator("#bouquetArt .wrap-left")).to_have_count(0)
    click(page,"#wrapBouquet")
    expect(page.locator("#bouquetArt .wrap-left")).to_be_visible()
    expect(page.locator("#editPosition")).to_be_disabled()
    page.locator("#bouquetArt").screenshot(path=str(OUT/(name+"-bouquet.png")),animations="disabled")
    with page.expect_download() as dl: click(page,"#svg")
    svg_file=OUT/(name+".svg"); dl.value.save_as(str(svg_file))
    svg=svg_file.read_text()
    assert "<svg" in svg and "wrap-tie" in svg and "position-handles" not in svg
    if mobile:
        # Force a share-capable mobile browser, then verify the actual File payload.
        page.evaluate("""()=>{Object.defineProperty(navigator,'canShare',{configurable:true,value:({files})=>files?.[0]?.type==='image/png'});Object.defineProperty(navigator,'share',{configurable:true,value:async({files})=>{const b=new Uint8Array(await files[0].arrayBuffer());window.qaShared={name:files[0].name,type:files[0].type,magic:Array.from(b.slice(0,8))}}})}""")
        click(page,"#png")
        expect(page.locator("#saveImageDialog")).to_be_visible()
        expect(page.locator("#savedBouquetImage")).to_be_visible()
        page.wait_for_function("()=>document.querySelector('#savedBouquetImage').naturalWidth===1200")
        assert page.locator("#savedBouquetImage").evaluate("el=>el.naturalHeight===1320&&el.src.startsWith('data:image/png;base64,')")
        click(page,"#shareBouquetImage")
        page.wait_for_function("()=>!!window.qaShared")
        assert page.evaluate("window.qaShared")=={"name":"our-garden-bouquet.png","type":"image/png","magic":[137,80,78,71,13,10,26,10]}
        with page.expect_download() as dl: click(page,"#downloadBouquetImage")
        png_file=OUT/(name+".png");dl.value.save_as(str(png_file))
        click(page,"#closeImageDialog")
        expect(page.locator("#saveImageDialog")).to_be_hidden()
    else:
        with page.expect_download() as dl: click(page,"#png")
        png_file=OUT/(name+".png"); dl.value.save_as(str(png_file))
    png=png_file.read_bytes()
    assert png[:8]==b"\x89PNG\r\n\x1a\n"
    assert struct.unpack(">II",png[16:24])==(1200,1320)
    snapshot=saved(page)
    go(page,"greenhouse","finalGarden")
    expect(page.locator("#gardenClosing")).to_be_hidden()
    click(page,"#openLetter")
    expect(page.locator("#envelopeLabel")).to_have_text("Pull out the letter")
    expect(page.locator("#gardenLetter")).to_be_hidden()
    assert page.locator("#letterEnvelope").evaluate("""svg=>{const r=svg.getBoundingClientRect(),f=svg.querySelector(".envelope-flap-back").getBoundingClientRect(),p=svg.querySelector(".envelope-insert").getBoundingClientRect(),t=document.querySelector("#letterStatus").getBoundingClientRect();return f.top>=r.top-1&&p.top>=r.top-1&&r.top>=t.bottom-1&&svg.querySelector(".envelope-flap-back").compareDocumentPosition(svg.querySelector(".envelope-insert"))&4}"""), "open flap or paper escapes reserved artwork / incorrect layer order"
    click(page,"#openLetter")
    expect(page.locator("#letterDialog")).to_be_visible()
    if reduce=="no-preference":
        expect(page.locator("#letterDialog")).to_have_attribute("data-paper-phase","unfolding")
        expect(page.locator("#gardenLetter")).to_be_hidden()
        expect(page.locator("#letterDialog .letter-fold-sheet")).to_be_visible()
    expect(page.locator("#letterDialog")).not_to_have_attribute("data-paper-phase","unfolding")
    expect(page.locator("#gardenLetter")).to_be_visible()
    expect(page.locator("#notice")).to_be_empty()
    page.locator("#gardenLetter").screenshot(path=str(OUT/(name+"-letter.png")),animations="disabled")
    click(page,"#closeLetter")
    if reduce=="no-preference":
        expect(page.locator("#letterDialog")).to_have_attribute("data-paper-phase","folding")
        expect(page.locator("#letterDialog .letter-fold-sheet")).to_be_visible()
    expect(page.locator("#letterDialog")).to_be_hidden()
    expect(page.locator("#gardenLetter")).to_be_hidden()
    expect(page.locator("#gardenClosing")).to_be_visible()
    expect(page.locator("#envelopeLabel")).to_have_text("Read the letter again")
    page.reload(wait_until="networkidle");click(page,"#openGate")
    expect(page.locator("#gardenJourney")).to_be_visible()
    expect(page.locator("#openGate")).not_to_have_attribute("aria-disabled","true")
    assert saved(page)==snapshot
    only_scene(page,"gardenPath")
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
        # Interrupt a second arrival by enabling reduced motion mid-pullback.
        click(page,"#openGate")
        page.wait_for_function("""()=>{const w=document.querySelector("#pathCamera").viewBox.baseVal.width;return w>180&&w<550}""")
        page.emulate_media(reduced_motion="reduce")
        expect(page.locator("#pathCamera")).to_have_attribute("viewBox","0 0 600 320")
        expect(page.locator("#openGate")).not_to_have_attribute("aria-disabled","true")
        expect(page.locator("#gardenJourney")).to_be_visible()
    assert not errors,errors
    assert all(u.startswith(url) or u.startswith(("blob:","data:")) or u==PEACH_GIF for u in requests),requests
    if reduce=="reduce": assert PEACH_GIF not in requests,requests
    print(json.dumps({"profile":name,"viewport":[width,height],"journey":"PASS","png_bytes":len(png),"svg_bytes":len(svg.encode()),"page_errors":len(errors),"external_requests":sum(u==PEACH_GIF for u in requests),"sticker_request_mocked":True}),flush=True)
    context.close()
def expansion_pilot(browser):
    context=browser.new_context(viewport={"width":390,"height":844},is_mobile=True,has_touch=True,reduced_motion="reduce",accept_downloads=True)
    page=context.new_page()
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    legacy={"version":1,"plants":{id:{"id":id,"stage":4} for id in SPECIES},"bouquet":["rose","rose~2"],"wrap":"blush","placements":{"rose":{"angle":10,"scale":1.3}},"wrapped":True}
    page.add_init_script("""(()=>{const k=%s;if(localStorage.getItem(k)===null)localStorage.setItem(k,%s)})()"""%(json.dumps(LEGACY_KEY),json.dumps(json.dumps(legacy))))
    page.goto(url,wait_until="networkidle")
    expect(page.locator("#app")).to_be_visible()
    assert saved(page)["version"]==2 and saved(page)["bouquet"]==legacy["bouquet"] and saved(page)["placements"]==legacy["placements"]
    assert saved(page)["stemColors"]=={"rose":"default","rose~2":"default"}
    expect(page.locator("#openLetter")).to_be_enabled()
    click(page,"#openGate");go(page,"gardenPath","nursery")
    for id in ["lily","carnation","lavender","orchid","hydrangea","ranunculus","dahlia","cosmos","daffodil","lisianthus","forgetmenot","magnolia"]: plant(page,id)
    expect(page.locator("#extraProgress")).to_have_text("Extended nursery: 12 of 12 flowers in bloom")
    page.locator('#plants select[data-color-id="rose"]').select_option("red")
    assert saved(page)["stemColors"]=={"rose":"default","rose~2":"default"}
    go(page,"nursery","glassEntrance");click(page,"#glassDoor")
    for id in ["lily","carnation","hydrangea","ranunculus","dahlia","cosmos","daffodil","lisianthus","forgetmenot","magnolia"]: click(page,f'#flowerTray button[data-id="{id}"][data-action="add"]')
    page.locator('#flowerTray select[data-color-id="rose~2"]').select_option("ivory")
    assert saved(page)["stemColors"]["rose~2"]=="ivory" and saved(page)["stemColors"]["rose"]=="default"
    click(page,"#undoBouquet");assert saved(page)["stemColors"]["rose~2"]=="default"
    click(page,"#redoBouquet");assert saved(page)["stemColors"]["rose~2"]=="ivory"
    expect(page.locator('#bouquetArt [data-flower="rose~2"] [fill="#fff4db"]').first).to_be_visible()
    assert len(saved(page)["bouquet"])==12
    click(page,"#wrapBouquet")
    stats=page.evaluate("""()=>{const svg=document.querySelector('#bouquetArt svg'),start=performance.now();for(let i=0;i<20;i++)GardenModel.bouquetSvg(JSON.parse(localStorage.getItem('the-garden-we-grew-v9-preview')),'QA');return {bytes:new TextEncoder().encode(svg.outerHTML).length,paths:svg.querySelectorAll('path').length,avgRenderMs:(performance.now()-start)/20}}""")
    click(page,"#png");expect(page.locator("#savedBouquetImage")).to_be_visible();page.wait_for_function("()=>document.querySelector('#savedBouquetImage').naturalWidth===1200")
    click(page,"#closeImageDialog");snapshot=saved(page)
    page.reload(wait_until="networkidle");expect(page.locator("#app")).to_be_visible();assert saved(page)==snapshot
    assert page.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",LEGACY_KEY)==legacy
    page.once("dialog",lambda d:d.accept());click(page,"#reset")
    page.reload(wait_until="networkidle");expect(page.locator("#app")).to_be_visible();assert saved(page)["plants"]=={}
    assert page.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",LEGACY_KEY)==legacy
    assert not errors,errors
    print(json.dumps({"expansion_pilot":"PASS","metrics":stats,"legacy_storage_unchanged":True}),flush=True)
    context.close()

try:
    with sync_playwright() as p:
        chrome=os.environ.get("GARDEN_QA_CHROME")
        browser=p.chromium.launch(headless=True, **({"executable_path":chrome} if chrome else {}))
        for name,w,h,mobile in [("desktop",1280,900,False),("mobile",390,844,True),("narrow",320,740,True)]:
            journey(browser,name,w,h,mobile)
        journey(browser,"normal-motion",390,844,True,"no-preference")
        journey(browser,"desktop-normal-motion",1280,900,False,"no-preference")
        expansion_pilot(browser)
        browser.close()
    print("Browser QA PASS; screenshots and exports:",OUT,flush=True)
finally:
    server.shutdown();server.server_close()
