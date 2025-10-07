export interface FAQEntry {
  keywords: string[];
  answer: string;
  followup?: string;
}

export const faqAnswers: FAQEntry[] = [
  {
    keywords: ["peak sound", "alarm sound", "beeping sound"],
    answer: "🔊 Try using the signal cut-off key to stop the alarm first.",
    followup: "If the sound continues, check if the bracket is tight. If not, reassemble it properly.",
  },
  {
    keywords: ["open table v1", "cannot open table v1", "table v1 stuck"],
    answer: "Use a size 4 hex key to unscrew the hole under the table to open it.",
    followup: "If it still doesn’t open, it might be a table issue. Please report it to the admin.",
  },
  {
    keywords: ["placemat v2", "change sign v2", "cannot change sign"],
    answer: "Apply masking tape on the acrylic and pull it off gently — this helps remove the sign easily.",
  },
  {
    keywords: ["no tools", "missing tool", "no hex key", "tool not found"],
    answer: "You can use the tools provided in the company kit bag — but don’t forget to return them afterward!",
  },
  {
    keywords: ["change poster", "poster won’t fit", "poster stuck"],
    answer:
      "Try reinstalling it more firmly. New posters can be tighter.\nYou can also insert white paper in the frame corners to hold the poster in place.",
  },
  {
    keywords: ["connect internet", "internet", "wifi", "dcota wifi"],
    answer:
      "Each store uses a different internet connection:\n- True, Dtac: Use SIM cards provided by the store\n- ASP, Telewiz, Jaymart, Banana: Use the store Wi-Fi (check on the Panogram home screen)\n- AIS: Use AIS Super Wi-Fi",
  },
  {
    keywords: ["dcota updating", "demo updating", "updating dcota"],
    answer:
      "If you see 'Demo update in progress, do not disturb the device', it means the DCOTA system is updating normally.",
    followup: "You can continue other steps or take photos for the report once the update is complete.",
  },
  {
    keywords: ["cannot find store", "wrong store", "store not found"],
    answer: "Try asking a nearby staff member or security guard for directions.",
  },
  {
    keywords: ["correct store", "right store", "check store name"],
    answer: "Check the store name on the old demo table or from the Panogram home screen.",
  },
  {
    keywords: ["start work", "when to start", "begin installation"],
    answer:
      "You can start working only after the store closes, and the shutter must be halfway down before starting.",
  },
  {
    keywords: ["when dcota", "dcota time", "dcota schedule"],
    answer:
      "DCOTA usually starts after 8 PM. If the store is still open, ask for permission before starting.",
  },
  {
    keywords: ["installation distance", "peak distance", "security distance"],
    answer: "Check the white measuring ruler included with the equipment for correct installation distance.",
  },
  {
    keywords: ["view store info", "speedtest", "check store data"],
    answer: "Refer to the user guide — it includes details for viewing store info, speed testing, and DCOTA setup.",
  },
  {
    keywords: ["security system", "lite security", "peak system"],
    answer:
      "Dtac, True, Power Buy, Power Mall, Banana = PEAK\nAIS, ASP, Telewiz = Lite Security",
  },
  {
    keywords: ["closing time", "store hours", "what time close"],
    answer:
      "Approximate closing times:\n- True, Dtac, ASP, Telewiz, Jaymart: 8:00 PM\n- AIS: According to mall hours (8:30–10:00 PM)\n- Power Buy, Power Mall, Banana: 9:30–10:00 PM",
  },
  {
    keywords: ["device missing", "missing equipment", "equipment incomplete"],
    answer:
      "If some devices are missing, skip that part and let the admin record the issue in the group chat.",
  },
  {
    keywords: ["wifi error", "cannot connect wifi", "wifi not working"],
    answer: "Ask store staff to check the Wi-Fi connection.",
  },
  {
    keywords: ["request tools", "borrow tools", "get tools", "tool request"],
    answer: "Scan the QR code on the Panogram display to request the required tools.",
  },
];
