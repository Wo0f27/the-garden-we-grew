// THE GARDEN WE GREW — PERSONALIZATION FILE
// Same editing pattern as museum-text.js. No HTML edits needed.
// Change quoted text only; keep field names, commas, braces and array structure.
// Use \n for a new line, \n\n for a new paragraph, and \" for a literal double quote.
// Keep tokens such as {count}, {total}, {max}, {flower}, and {stage} in dynamic text.
// MAIN PERSONAL SECTIONS: 01–05, 07, 09–10. Technical controls are optional to edit.
// The letter is currently placeholder writing; replace it before gifting.

window.GARDEN_TEXT = {

  // =====================================================================
  // 01 · TITLE & GARDEN ENTRANCE
  // =====================================================================
  brand: "The Garden We Can Call Our Own",
  eyebrow: "Our safe little bubble for our botanical needs haha",
  title: "A Garden Of Our Own",
  intro: "Take a little breather on your very own garden, considering it's been appearing alot on your reels haha.",
  enter: "Step into the garden",
  gateOpened: "The gate is open",

  // =====================================================================
  // 02 · BEYOND THE GATE
  // =====================================================================
  pathKicker: "Beyond the gate",
  pathTitle: "A garden under your care",
  pathIntro: "The flowers you tend will find a little place along this path. Come back as often as you like, it's all yours my love.",
  pathReady: "The garden is craving for your care, like me hehe.",
  pathGrown: "{count} of {total} flowers are in bloom along the path.",
  visitNursery: "Visit the nursery",

  // =====================================================================
  // 03 · THE NURSERY
  // =====================================================================
  nurseryChapter: "I.",
  nurseryKicker: "The nursery",
  nurseryTitle: "Something to nurture",
  nurseryIntro: "Choose any flower. Water it a little at a time until it blooms, then bring it with you to the greenhouse.",
  nurseryProgress: "{count} of {total} flowers in bloom",
  readyToPlant: "Ready to plant",
  stages: ["Seed", "Sprout", "Stem and leaves", "Bud", "In bloom"],
  plant: "Plant seed",
  water: "Water gently",
  add: "Add to bouquet",
  added: "In your bouquet",
  backPath: "Back to the garden path",

  // =====================================================================
  // 04 · FLOWER MESSAGES — personalize each meaning and message
  // =====================================================================
  flowers: {
    rose: {name:"Rose", meaning:"Love", message:"The first actual flower I gave you. I still remember how it brought you so much joy. They say this means love, a reminder of how much I love you and that I will always do."},
    peony: {name:"Peony", meaning:"Happiness", message:"A flower you recently found and started to adore, I was hoping to find a shop selling some but I wasn't able to properly find one. Apparently it means happiness, to me it shows the happiness you make me feel. I'm grateful that I have you in my life. I hope I can make you as happy, as you deserve nothing but happiness."},
    tulip: {name:"Tulip", meaning:"Affection", message:"Apparently, tulips mean affection. Reminds me of how affectionate you are to me, my lovely cutie baby. I miss you."},
    daisy: {name:"Daisy", meaning:"New beginnings", message:"As we open new chapters of our lives together, there is always something new to find and experience especially for us. Let's discover them together and may we create more fun memories with them. I look forward to our future together. Know that I'll always be on your side, okay?"},
    sunflower: {name:"Sunflower", meaning:"Adoration", message:"Sunflower surprised me cause some say they mean adoration. Like how much I adore my lovely, cutie, sexy, beautiful, the prettiest and most gorgeous baby lovelove in the wide universe, My cutie baby Ck."},
    gypsophila: {name:"Baby's breath", meaning:"Lasting love", message:"The very first flower you told me you love when we first met. I handcrafted some to give to you, do you still have them? I miss making them for you, I definitely should start again. They say they mean lasting love, just like my love for you that's everlasting. A love that will never change. I'll always be yours, I love you."}
  },

  // =====================================================================
  // 05 · PEACH AT THE NURSERY & GREENHOUSE
  // =====================================================================
  peachName: "Peach",
  peachNurseryInvite: "Come on! Let’s head to the greenhouse and see what we can make with your flowers.",
  peachGreenhouseButton: "Let’s go to the greenhouse",
  glassKicker: "Among the glass and vines",
  glassTitle: "A greenhouse of little treasures",
  glassIntro: "Bring the flowers you have grown inside and arrange them into something of your own.",
  peachGlassInvite: "We’re here! Tap the doors to open them. I’ll meet you inside!",
  backNursery: "Return to the nursery",
  backGlass: "Back outside the greenhouse",

  // =====================================================================
  // 06 · GREENHOUSE WORKBENCH
  // =====================================================================
  bouquetChapter: "II.",
  bouquetKicker: "The greenhouse",
  bouquetTitle: "Make something of your own",
  bouquetIntro: "Gather the flowers you have grown and make a bouquet that is yours to keep.",
  workbenchLabel: "The florist's workbench",
  trayTitle: "Flowers from your garden",
  trayHint: "Add any bloomed flower, or add another of the same kind. Use the arrows to change the order, or × to remove a stem. Choose up to 12.",
  trayReady: "Ready to add",
  trayGrowing: "Still growing",
  traySelected: "Selected",
  trayAdd: "Add",
  trayAddMore: "Add another",
  bouquetCount: "{count} / {max} flowers in your bouquet",
  emptyBouquet: "Grow a flower and add it to your bouquet.",
  moveEarlierSymbol: "↑",
  moveLaterSymbol: "↓",
  removeSymbol: "×",
  moveEarlier: "Move earlier",
  moveLater: "Move later",
  removeStem: "Remove",

  // =====================================================================
  // 07 · PEACH'S OPTIONAL TUTORIAL
  // =====================================================================
  helpButton: "Need help?",
  helpTitle: "Let’s make your bouquet!",
  helpIntro: "Hi! Peach here. You can make your bouquet however you like.",
  helpAdd: "Add any bloomed flower. Tap Add another to use more of the same kind, up to 12 stems in total. You can leave out any flowers you don’t want.",
  helpArrange: "Use ↑ and ↓ to change the order, or × to remove one stem. Undo and redo let you try things without losing your work.",
  helpPosition: "Tap Position the flowers and drag a flower head, or use the position controls to tilt or raise one stem. Unwrap first if you have already wrapped it.",
  helpFinish: "Choose your paper, ribbon and greenery, then wrap and save your bouquet. Growing all six kinds unlocks the letter, even if you don’t include them in your bouquet.",
  helpClose: "Got it!",

  // =====================================================================
  // 08 · POSITIONING & FINISHING TOUCHES
  // =====================================================================
  finishBouquetTitle: "Finishing touches",
  editPosition: "Position the flowers",
  finishPosition: "Done positioning",
  positionHint: "Turn on positioning to drag the flower markers. You can still use the controls below.",
  positionActive: "Drag a flower marker to adjust its angle and height. Finish positioning to scroll normally here.",
  positionWrapped: "Unwrap your bouquet to position individual flowers.",
  positionEmpty: "Add a flower to arrange it.",
  positionFlower: "Choose a flower to adjust",
  tiltLeft: "Tilt left",
  tiltRight: "Tilt right",
  raiseFlower: "Raise",
  lowerFlower: "Lower",
  resetFlower: "Reset this flower",
  autoArrange: "Arrange automatically",
  undoBouquet: "Undo",
  redoBouquet: "Redo",
  historyHint: "Undo and redo apply only to bouquet edits in this visit. Your growing flowers are never undone.",
  wrapLabel: "Wrapping paper",
  paperStyleLabel: "Paper design",
  wraps: {ivory:"Ivory", blush:"Blush pink", sage:"Sage green"},
  paperStyles: {plain:"Plain paper", botanical:"Botanical print", stripe:"Fine stripes"},
  ribbonLabel: "Ribbon",
  ribbonStyleLabel: "Ribbon design",
  ribbons: {rose:"Dusty rose", gold:"Soft gold", forest:"Forest green"},
  ribbonStyles: {bow:"Classic bow", long:"Trailing ribbon", knot:"Small knot"},
  greeneryLabel: "Add greenery",
  paperPreviewStatus: "Paper preview · tap Wrap my bouquet to finish",
  wrapButton: "Wrap my bouquet",
  unwrapButton: "Unwrap to rearrange",
  wrapReady: "Your bouquet is wrapped and ready to keep.",
  wrapWaiting: "Choose your paper and ribbon to preview them, then wrap your bouquet to finish.",
  wrapEmpty: "Add a flower to begin.",
  savePng: "Save as image",
  saveSvg: "Save as SVG",
  exportHint: "The keepsake is created entirely on this device. Nothing is uploaded.",
  visitBench: "Continue to the garden bench",

  // =====================================================================
  // 09 · THE BENCH & ENVELOPE
  // =====================================================================
  finalKicker: "At the end of the path",
  finalTitle: "A quiet place for two",
  finalIntro: "There is a bench beneath the tree, waiting for you whenever you want to rest.",
  letterStationLabel: "A letter beneath the tree",
  letterProgress: "{count} of {total} flowers in bloom",
  letterWaiting: "There are still flowers to grow before the letter is ready.",
  letterReady: "The garden is in bloom. There is a letter waiting for you.",
  letterLocked: "A sealed letter",
  openLetter: "Open the letter",
  letterOpening: "Opening the envelope…",
  letterPull: "Pull out the letter",
  letterExtracting: "Unfolding your letter…",
  letterOpened: "Read the letter again",
  closeLetter: "Fold the letter",
  returnBouquet: "Return to your bouquet",

  // =====================================================================
  // 10 · YOUR PERSONAL LETTER & CLOSING MESSAGE
  // =====================================================================
  letterHeading: "My love,",
  letterBody: "Thank you for taking the time to wander through this little garden. The messages earlier might sound cringy or over the top but they're true. I appreciate and grateful that you're with me. I may be flawed but I'm willing to keep making improvements until I become a better man for you. I love you and will always do. Thank you for taking care of me. Thank you for loving me. I am so lucky to have you that I don't really know how my life would've been like if you're not with me. Anyway, our anniversary is closing, wishing I can see you soon. I love you, okay? Sorry this is a little short, I am starting to worry that my letters are getting old haha. Anyway, whatever challenges you face, no matter how bad things are, I'll always be by your side. And know, I believe in you, I always will. Buhay lang yan, you're My Ck, whatever it throws at you, I know you're always gonna come on top (of me ;))\n\nPs. I love you",
  letterSign: "With so much love",
  closingTitle: "A lifetime with you is what I'm wishing for",
  closing: "This is only the beginning of our little garden. There will always be room for another flower. (But you're the only flower I want hehe)",

  // =====================================================================
  // 11 · STATUS MESSAGES & RESET (normally leave these alone)
  // =====================================================================
  waterNotice: "{flower}: {stage}",
  addNotice: "{flower} added to your bouquet.",
  exportReady: "Your bouquet is ready to save.",
  exportFailed: "PNG export unavailable on this browser. Choose Save as SVG instead.",
  reset: "Start a new garden",
  resetConfirm: "Clear the flowers and bouquet saved on this device?",
  resetDone: "A new garden is ready.",
  saveFailed: "This browser could not save the garden. Keep this tab open.",
  storageUnavailable: "Local storage is unavailable or could not be read.",

  // =====================================================================
  // 12 · ACCESSIBILITY DESCRIPTIONS (normally leave these alone)
  // =====================================================================
  pathArtLabel: "A winding garden path leading to a glass greenhouse, with flowers growing beside it",
  progressLabel: "Flowers in bloom",
  peachAlt: "Peach raising her paw",
  glassArtLabel: "A glass greenhouse surrounded by flowers",
  glassDoorLabel: "Open the greenhouse doors",
  finalArtLabel: "A garden bench underneath a flowering tree at sunset",
};
