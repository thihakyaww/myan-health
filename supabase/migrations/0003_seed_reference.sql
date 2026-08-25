-- ============================================================
-- MyanHealth Reference Seed Data (PRD §6)
-- ============================================================

insert into public.disease_types (name_en, name_mm, category) values
  ('Dengue',             'ဒီင်းဘူး',        'VECTOR_BORNE'),
  ('Tuberculosis',       'တီဘီရိုး',          'AIRBORNE'),
  ('Influenza',          'တုပ်ကွေး',            'RESPIRATORY'),
  ('COVID-19',           'ကိုဗစ်-၁၉',         'RESPIRATORY'),
  ('Diarrheal disease',  'ဝမ်းချုပ်ရောဂါ',     'WATERBORNE'),
  ('Other',              'အခြား',               'OTHER'),
  ('Not sure',           'မသေချာပါ',          'OTHER')
on conflict (name_en) do nothing;

insert into public.symptom_options (name_en, name_mm) values
  ('Fever',                 'အဖျားရှိခြင်း'),
  ('Cough',                 'ချောင်းဆိုးခြင်း'),
  ('Headache',              'ခေါင်းကိုက်ခြင်း'),
  ('Diarrhea',              'ဝမ်းလျှောခြင်း'),
  ('Vomiting',              'အန်ခြင်း'),
  ('Rash',                  'အရေပြားအနီကွဲခြင်း'),
  ('Sore throat',           'လည်ချောင်းနာခြင်း'),
  ('Difficulty breathing',  'အသက်ရှူပင်ပန်းခြင်း'),
  ('Other',                 'အခြား')
on conflict (name_en) do nothing;
