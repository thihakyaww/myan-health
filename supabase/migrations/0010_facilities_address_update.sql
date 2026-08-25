-- Facilities address + opening_hours update (2026-08-23 research)
-- Addresses from verified sources; formatted_address + lat/lng left for LocationPicker

-- ═══════════════════════════════════════════════════
-- SECTION A: Street address found (🟢🟡 confidence)
-- ═══════════════════════════════════════════════════

-- Asia Royal Hospital (🟢)
UPDATE public.facilities SET
  address = 'No. 14, Baho Street, Sanchaung Township, Yangon',
  opening_hours = 'Emergency: 24/7',
  updated_at = now()
WHERE id = '5b69ac76-325d-43cc-b033-c80a394094da';

-- 500-bed Specialty Hospital (🟢)
UPDATE public.facilities SET
  address = 'Min Ye Kyaw Swar Road, Lanmadaw Township, Yangon',
  updated_at = now()
WHERE id = 'c0475aaa-057f-4972-b22d-5bb3a04940ea';

-- Yangon Mental Health Hospital (🟢)
UPDATE public.facilities SET
  address = 'Ywar Thar Gyi Ward, East Dagon Township, Yangon',
  updated_at = now()
WHERE id = 'b1e14dfe-b7c4-4e16-8002-14e3bcef5622';

-- Grand Hantha International Hospital (🟡)
UPDATE public.facilities SET
  address = 'Kan Yeik Thar Road, Dagon Township, Yangon',
  updated_at = now()
WHERE id = '12490c52-bc48-4785-951b-92ffd0f33a89';

-- Kan Thar Yar International Specialist Hospital (🟡)
UPDATE public.facilities SET
  address = 'No. 138, Kan Thar Yar Street, Bahan Township, Yangon',
  updated_at = now()
WHERE id = 'c7a5c670-4f10-4f38-a250-ea4854cd69b8';

-- Pun Hlaing International Hospital (🟡)
UPDATE public.facilities SET
  address = 'Pun Hlaing Estate, Hlaing Tharyar Township, Yangon',
  updated_at = now()
WHERE id = '61f15046-ce5e-4c76-bee3-58ad5a6c5e7d';

-- Parami General Hospital (🟡)
UPDATE public.facilities SET
  address = 'Parami Road, Mayangone Township, Yangon',
  updated_at = now()
WHERE id = 'f9fc9779-ea53-4e3f-a5a8-94519d9c3292';

-- Bahosi Medical Centre (🟡)
UPDATE public.facilities SET
  address = 'Bahosi Housing Complex, Lanmadaw Township, Yangon',
  updated_at = now()
WHERE id = '197cd562-975f-42f6-8875-24b4b6b31474';

-- Myanmar Red Cross Society — Headquarters (🟡)
UPDATE public.facilities SET
  address = 'Theinbyu Road, Botataung Township, Yangon',
  updated_at = now()
WHERE id = '7cbc36b3-bed9-4151-990b-b2a5aff0f115';


-- ═══════════════════════════════════════════════════
-- SECTION B: Township confirmed, street pending (🔵)
-- ═══════════════════════════════════════════════════

-- East Yangon General Hospital
UPDATE public.facilities SET
  address = 'Botataung Township, Yangon',
  opening_hours = 'Emergency: 24/7',
  updated_at = now()
WHERE id = '4c6fc274-3d41-4d25-8394-37a9015b613f';

-- Insein General Hospital
UPDATE public.facilities SET
  address = 'Insein Township, Yangon',
  opening_hours = 'Emergency: 24/7',
  updated_at = now()
WHERE id = 'c6a3a353-6026-4984-ae0c-9b52338c93fc';

-- North Okkalapa General Hospital
UPDATE public.facilities SET
  address = 'North Okkalapa Township, Yangon',
  opening_hours = 'Emergency: 24/7',
  updated_at = now()
WHERE id = '59640cfa-2106-4df5-b52b-00f273c4f570';

-- Thingangyun Sanpya General Hospital
UPDATE public.facilities SET
  address = 'Thingangyun Township, Yangon',
  updated_at = now()
WHERE id = '2f57d6b2-336a-40cd-8662-0ff9bd9e8d0e';

-- Yangon General Hospital
UPDATE public.facilities SET
  address = 'U Wisara Road, Bahan Township, Yangon',
  opening_hours = 'Emergency: 24/7',
  updated_at = now()
WHERE id = 'c2862c98-8a22-4a1b-90b3-4f94476898c2';

-- New Yangon General Hospital
UPDATE public.facilities SET
  address = 'Dagon Township, Yangon',
  opening_hours = 'Emergency: 24/7',
  updated_at = now()
WHERE id = '8188d1fe-f042-41e3-ab02-55bbdbbde473';

-- New Yangon Specialist Hospital
UPDATE public.facilities SET
  address = 'Downtown Yangon',
  updated_at = now()
WHERE id = '02591342-5f52-4dba-8720-330238ae35f5';

-- West Yangon General Hospital
UPDATE public.facilities SET
  address = 'Bahan Township, Yangon',
  updated_at = now()
WHERE id = '01651941-f281-4b29-96d3-4fe0628aed45';

-- Yangon Children's Hospital
UPDATE public.facilities SET
  address = 'Myenigon compound, Bahan Township, Yangon',
  opening_hours = 'Pediatric emergency: 24/7',
  updated_at = now()
WHERE id = '5599f22d-bbbd-41d8-a793-1ded8fc834f5';

-- Yankin Children's Hospital
UPDATE public.facilities SET
  address = 'Yankin Township, Yangon',
  updated_at = now()
WHERE id = 'a37939ed-6ec4-4663-9391-bed51bb8c51e';

-- Yangon ENT Hospital
UPDATE public.facilities SET
  address = 'Yangon',
  updated_at = now()
WHERE id = '4102e7f3-d4f2-4ed6-a6bd-83d1bb058ef8';

-- Central Women's Hospital, Yangon
UPDATE public.facilities SET
  address = 'Downtown Yangon',
  opening_hours = 'Obstetric emergency: 24/7',
  updated_at = now()
WHERE id = 'b06b877a-4f10-4797-a0d9-6c832d59aa4e';

-- South Okkalapa Women and Children Hospital
UPDATE public.facilities SET
  address = 'South Okkalapa Township, Yangon',
  updated_at = now()
WHERE id = '22ed250a-af51-4cb7-8ee8-6052e37dfe97';

-- Yangon Orthopaedic Hospital
UPDATE public.facilities SET
  address = 'Thaketa Township, Yangon',
  updated_at = now()
WHERE id = '863c8246-a8a7-4aee-8a9c-4a456aac9cba';

-- Waibargi Hospital
UPDATE public.facilities SET
  address = 'North Okkalapa area, Yangon',
  updated_at = now()
WHERE id = 'e74cc9b9-181c-4c5b-8dc3-a7653822edf6';

-- Yangon Workers' Hospital
UPDATE public.facilities SET
  address = 'Yangon',
  updated_at = now()
WHERE id = 'ba772f0c-bace-4591-a786-4da5fc661cd5';

-- Mandalay General Hospital
UPDATE public.facilities SET
  address = 'Chanayethazan Township, Mandalay',
  updated_at = now()
WHERE id = '319f00c4-4ff7-46d6-b20f-25b3803a5d0e';


-- ═══════════════════════════════════════════════════
-- SECTION C: Urban Health Centers (🔵 township-level)
-- ═══════════════════════════════════════════════════

-- Bahan Urban Health Center
UPDATE public.facilities SET
  address = 'Bahan Township, Yangon',
  updated_at = now()
WHERE id = 'ec5ccdb6-c159-460c-93f1-463d30e6060d';

-- Sanchaung Urban Health Center
UPDATE public.facilities SET
  address = 'Sanchaung Township, Yangon',
  updated_at = now()
WHERE id = '06846308-5871-45b5-b846-a394725b5e76';

-- Hlaing Urban Health Center
UPDATE public.facilities SET
  address = 'Hlaing Township, Yangon',
  updated_at = now()
WHERE id = '61774602-9908-4d77-b1a0-5421125d19d9';

-- Mayangone Urban Health Center
UPDATE public.facilities SET
  address = 'Mayangone Township, Yangon',
  updated_at = now()
WHERE id = '3288c355-b0ba-4348-b739-c07712c3c12e';

-- Insein Urban Health Center
UPDATE public.facilities SET
  address = 'Insein Township, Yangon',
  updated_at = now()
WHERE id = '03e701ea-19a0-45ec-b992-087e9aa441c0';

-- Thingangyun Urban Health Center
UPDATE public.facilities SET
  address = 'Thingangyun Township, Yangon',
  updated_at = now()
WHERE id = '39ec2a00-e6e8-40c4-bfdb-532270038786';

-- North Okkalapa Urban Health Center
UPDATE public.facilities SET
  address = 'North Okkalapa Township, Yangon',
  updated_at = now()
WHERE id = '81c6879e-1f90-4c78-8284-c4fe1f0a520f';

-- South Okkalapa Urban Health Center
UPDATE public.facilities SET
  address = 'South Okkalapa Township, Yangon',
  updated_at = now()
WHERE id = '19dec6aa-6763-4df3-a30c-562c75187ad2';

-- Chanayethazan Urban Health Center (Mandalay)
UPDATE public.facilities SET
  address = 'Chanayethazan Township, Mandalay',
  updated_at = now()
WHERE id = '340e89b1-73a8-4c9c-954e-7a19b117fecf';
