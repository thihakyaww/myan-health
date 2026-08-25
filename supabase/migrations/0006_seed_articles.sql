-- ============================================================
-- Sample editorial articles (bilingual, MM-first) for Phase 3 testing.
-- General health-education content; admins can edit/delete in Phase 6.
-- ============================================================

insert into public.articles (title_mm, title_en, slug, body_mm, body_en, category, tags, status, published_at) values

(
  'ဒီင်းဘူး ကာကွယ်ရေး — အိမ်တွင်းမှ စလုပ်ကြမယ်',
  'Dengue prevention starts at home',
  'dengue-prevention-starts-at-home',
  E'ဒီင်းဘူး ရောဂါသည် အဲဒီစ် အီဂျစ်ပတီ ခြင်မျိုးဆက်များ ကိုက်ခြင်းဖြင့် ကူးစက်တတ်ပါသည်။ မိုးရာသီတွင် ကူးစက်မှု ပိုများတတ်ပါသည်။\n\n**အိမ်တွင် လုပ်ဆောင်နိုင်သည့် ကာကွယ်မှုများ**\n- ရေစု၊ ရေဝပ်နေသည့် နေရာများကို အမြဲရှင်းလင်းပါ။\n- ရေသိုလှောင်ကွန်တိန်နာများတွင် အဖုံးအုပ်ပါ သို့မဟုတ် အလုံပိတ်ပါ။\n- ခြင်ထောင်၊ ခြင်ဆေး၊ လက်ကိုင်ဖုန်းစွပ် စသည်တို့ကို အသုံးပြုပါ။\n\n**သတိထားသင့်သည့် လက္ခဏာများ**\nကိုက်ခံရပြီးနောက် မြင့်မားသော အဖျား၊ ခေါင်းအလွန်ကိုက်ခြင်း၊ မျက်စိနောက်ကျော နာကျင်ခြင်း၊ ကိုယ်လက် အနီရောင် အနာကွဲခြင်းများ ပေါ်ပါက ဆေးရုံတက်၍ စမ်းသပ်စစ်ဆေးသင့်ပါသည်။\n\n**အရေးကြီးသတိပေးချက်** — ဤသတင်းသည် ပညာပေးရန်သာဖြစ်ပြီး ဆေးဘက်ဆိုင်ရာ အတည်ပြုချက် မဟုတ်ပါ။ စိုးရိမ်သည့် လက္ခဏာရှိပါက ဆရာဝန်နှင့် ပြသပါ။',
  E'Dengue is transmitted through the bite of infected Aedes mosquitoes and spreads most during the rainy season.\n\n**Prevention you can do at home**\n- Clear stagnant water around the house regularly.\n- Keep water-storage containers tightly covered.\n- Use mosquito nets, repellent, and protective clothing.\n\n**Warning signs**\nIf high fever, severe headache, pain behind the eyes, or skin rashes appear after a mosquito bite, visit a clinic for testing.\n\n**Disclaimer** — This article is for health education only and is not medical advice. See a doctor if you have concerning symptoms.',
  'PREVENTION',
  ARRAY['dengue','mosquito','rainy season'],
  'PUBLISHED', now()
),

(
  'တီဘီရောဂါ — သိထားသင့်တဲ့ အချက် ၅ ချက်',
  'Tuberculosis — five things to know',
  'tuberculosis-five-things-to-know',
  E'၁။ ချောင်းဆိုးခြင်း ၂ ပတ်ကြောင်း ဆက်တိုက်ရှိပါက တီဘီ စစ်ဆေးဖို့ လိုအပ်ပါသည်။\n\n၂။ တီဘီသည် ရာသီချုပ် ကုသနိုင်ပါသည်။ ဆေးကို ညွှန်ကြားချက်အတိုင်း အချိန်ပြည့် ဆက်တိုက်သောက်ရမည် ဖြစ်ပါသည်။\n\n၃။ ဆေးကြောင့် ပျံ့လွင့်နိုင်သည့် အချိန်တွင် နှာချေ၊ ချောင်းဆိုးသည့်အခါ ပါးစပ်ကို ဖုံးအုပ်ပါ။\n\n၄။ မြန်မာနိုင်ငံ၏ အစိုးရ ကျန်းမာရေး ဌာနများတွင် တီဘီ စစ်ဆေးမှုနှင့် ကုသမှုကို အခမဲ့ ရရှိနိုင်ပါသည်။\n\n၅။ ဆေး အလယ်ရပ်ခြင်းသည် ဆေးခံနိုင်သော တီဘီ ဖြစ်စေနိုင်ပြီး ကုသရန် ခက်ခဲစေပါသည်။\n\n*MyanHealth ၏ ဤသတင်းသည် ပညာပေးချက်သာဖြစ်ပြီး ရောဂါရှာဖွေ အတည်ပြုချက် မဟုတ်ပါ။*',
  E'1. If a cough lasts more than two weeks, get tested for TB.\n\n2. TB is curable. Take your medicine exactly as prescribed, for the full duration.\n\n3. Cover your mouth when coughing or sneezing to reduce spread.\n\n4. Testing and treatment are available free of charge at government health services in Myanmar.\n\n5. Stopping medication early can lead to drug-resistant TB, which is much harder to treat.\n\n*This MyanHealth article is educational and is not a diagnosis.*',
  'DISEASE_INFO',
  ARRAY['tuberculosis','tb','public health'],
  'PUBLISHED', now()
),

(
  'လက်ဆေးခြင်းနှင့် ဝမ်းချုပ်ရောဂါ ကာကွယ်ရေး',
  'Hand hygiene and preventing diarrheal disease',
  'hand-hygiene-and-diarrheal-disease',
  E'ဝမ်းချုပ်ရောဂါ၏ အဓိက ကူးစက်လမ်းကြောင်းမှာ ညစ်ညမ်းသော ရေနှင့် အစားအစာ၊ လက်မသန့်ခြင်း တို့ဖြစ်ပါသည်။\n\n**လက်ဆေးခြင်း ၅ အချိန်**\n- စားသောက်မှု မလုပ်ခင်\n- ကလေး စားကျွေးမှု မလုပ်ခင်\n- အိမ်သာ သွားပြီးနောက်\n- ကလေး အိမ်သာ စွန့်ပစ်ပြီးနောက်\n- မီးဖိုချောင် လုပ်ငန်း မစခင်\n\n**ဝမ်းလျှောသည့်အခါ အရေးကြီးဆုံး**\nရေဓာတ်ပြန်ဝင်စေရန် ORS ဆေးရည်ကို ဆက်တိုက် သောက်ပါ။ ကလေးငယ်များတွင် ရေဓာတ်ခန်းခြောက်ခြင်း လျင်မြန်စွာ ဖြစ်နိုင်ပါသည်။\n\n**ဆရာဝန်ပြသရန် အချိန်** — သွေးပါဝမ်းလျှော၊ အဖျားပါဝင်ခြင်း၊ ရေမတ်မနိုင် အန်ခြင်း၊ ကလေး ပိန်လှီးလာပါက ဆေးရုံ ချက်ချက် ပြပါ။',
  E'Diarrheal disease spreads mainly through unsafe water and food, and unwashed hands.\n\n**Five moments for handwashing**\n- Before eating\n- Before feeding children\n- After using the toilet\n- After cleaning a child\n- Before preparing food\n\n**Most important during diarrhea**\nKeep drinking ORS solution to replace fluids. Young children dehydrate quickly.\n\n**When to see a doctor** — bloody stool, fever, persistent vomiting, or signs of dehydration in a child require immediate care.',
  'HEALTH_TIPS',
  ARRAY['hygiene','diarrhea','ors'],
  'PUBLISHED', now()
)

on conflict (slug) do nothing;
