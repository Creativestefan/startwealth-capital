--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."User" (id, "firstName", "lastName", "dateOfBirth", email, password, "emailVerified", "verificationToken", "verificationExpires", image, role, "createdAt", "updatedAt", "resetToken", "resetTokenExpires", "isBanned", "resetOtp", "resetOtpExpires", "referralCode") FROM stdin;
\.


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Equipment; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."Equipment" (id, name, description, type, price, status, "createdAt", "updatedAt", features, "stockQuantity", images) FROM stdin;
\.


--
-- Data for Name: EquipmentTransaction; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."EquipmentTransaction" (id, "equipmentId", "userId", status, "createdAt", "updatedAt", quantity, "trackingNumber", "deliveryDate", "totalAmount", "deliveryAddress", "deliveryPin", "commissionAmount", "commissionPaid", "referralId") FROM stdin;
\.


--
-- Data for Name: GreenEnergyPlan; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."GreenEnergyPlan" (id, name, description, type, "minAmount", "maxAmount", "returnRate", "durationMonths", image, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: GreenEnergyInvestment; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."GreenEnergyInvestment" (id, "userId", type, amount, status, "startDate", "endDate", "expectedReturn", "actualReturn", reinvest, "createdAt", "updatedAt", "planId", "commissionAmount", "commissionPaid", "referralId") FROM stdin;
\.


--
-- Data for Name: InvestmentPlan; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."InvestmentPlan" (id, name, description, type, "minAmount", "maxAmount", "returnRate", image, "createdAt", "updatedAt", "durationMonths") FROM stdin;
\.


--
-- Data for Name: KYC; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."KYC" (id, "userId", status, country, "documentType", "documentNumber", "documentImage", "submittedAt", "reviewedAt", "rejectionReason", "reviewedBy") FROM stdin;
\.


--
-- Data for Name: MarketInvestmentPlan; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."MarketInvestmentPlan" (id, name, description, type, "minAmount", "maxAmount", "returnRate", "durationMonths", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MarketInvestment; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."MarketInvestment" (id, "userId", amount, "startDate", "endDate", "expectedReturn", "actualReturn", "createdAt", "updatedAt", reinvest, status, "commissionAmount", "commissionPaid", "planId", "referralId") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."Notification" (id, "userId", type, title, message, read, "createdAt", "updatedAt", "actionUrl") FROM stdin;
\.


--
-- Data for Name: NotificationPreference; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."NotificationPreference" (id, "userId", "emailEnabled", "pushEnabled", "investmentNotifications", "paymentNotifications", "kycNotifications", "referralNotifications", "walletNotifications", "systemNotifications", "commissionNotifications", "securityNotifications", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Property; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."Property" (id, name, description, price, location, "mapUrl", features, images, status, "createdAt", "updatedAt", "mainImage") FROM stdin;
\.


--
-- Data for Name: PropertyTransaction; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."PropertyTransaction" (id, "propertyId", "userId", amount, type, status, installments, "installmentAmount", "nextPaymentDue", "createdAt", "updatedAt", "paidInstallments", "commissionAmount", "commissionPaid", "referralId") FROM stdin;
\.


--
-- Data for Name: PushSubscription; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."PushSubscription" (id, "userId", subscription, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RealEstateInvestment; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."RealEstateInvestment" (id, "userId", type, amount, status, "startDate", "endDate", "expectedReturn", "actualReturn", reinvest, "createdAt", "updatedAt", "commissionAmount", "commissionPaid", "referralId") FROM stdin;
\.


--
-- Data for Name: Referral; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."Referral" (id, "referrerId", "referredId", commission, status, "createdAt", "updatedAt", "commissionPaid") FROM stdin;
\.


--
-- Data for Name: ReferralCommission; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."ReferralCommission" (id, "referralId", "userId", amount, status, "transactionType", "createdAt", "updatedAt", "paidAt", "propertyTransactionId", "equipmentTransactionId", "marketInvestmentId", "realEstateInvestmentId", "greenEnergyInvestmentId") FROM stdin;
\.


--
-- Data for Name: ReferralSettings; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."ReferralSettings" (id, "propertyCommissionRate", "equipmentCommissionRate", "marketCommissionRate", "greenEnergyCommissionRate", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: UserActivity; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."UserActivity" (id, "userId", type, description, status, amount, "timestamp", metadata) FROM stdin;
\.


--
-- Data for Name: Wallet; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."Wallet" (id, "userId", balance, "createdAt", "updatedAt", "btcAddress", "usdtAddress") FROM stdin;
\.


--
-- Data for Name: WalletSettings; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."WalletSettings" (id, "btcWalletAddress", "usdtWalletAddress", "usdtWalletType", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WalletTransaction; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public."WalletTransaction" (id, "walletId", type, amount, status, "cryptoType", "txHash", "createdAt", "updatedAt", description) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: startwealth
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
901c6c4d-cad2-423c-b95c-4be181fa784b	d2c8725c2f8c9b1a716ebdc20f2c99d79a9895b4b86822f49f5bb7dbc8840518	2025-04-22 22:22:23.463151+01	20250227140350_init	\N	\N	2025-04-22 22:22:23.445606+01	1
8c0a0141-6ce2-4d85-aa5e-b90643bff78a	e2c5994147264915240e6680eab983e8dc12dc6d54582cf48d3732527d8f5f11	2025-04-22 22:22:23.525725+01	20250310163059_add_duration_months_to_investment_plan	\N	\N	2025-04-22 22:22:23.524901+01	1
aa6d92c2-7f13-4556-9713-cedb1834c462	ea4291964f882b950dcc231f279bd6aadf66ffc9de396519ddcf765158f197df	2025-04-22 22:22:23.465078+01	20250227155513_add_reset_token_fields	\N	\N	2025-04-22 22:22:23.463579+01	1
292596ab-93f8-40e3-8a78-6071da3fea34	7de2800801eac735d72e7deb990eac8386801b92ece19c86d437e865245287ad	2025-04-22 22:22:23.466801+01	20250227160431_remove_reset_token_fields	\N	\N	2025-04-22 22:22:23.465512+01	1
1b11025f-1fe8-4f35-beaa-0d9c10f57b5e	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-04-22 22:22:23.468073+01	20250227214038_add_property	\N	\N	2025-04-22 22:22:23.46723+01	1
2dc2a37c-5794-4dc5-b2ea-c2af3231ee5a	e5f1a56f23f338ebfad32ff66d450ae42b618468faeccafb91f9e9642b83f8ac	2025-04-22 22:22:23.535126+01	20250310213551_update_green_energy_models	\N	\N	2025-04-22 22:22:23.526059+01	1
55a43081-e9d7-4e3e-b2df-51d4e8c5db22	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-04-22 22:22:23.469295+01	20250227214134_add_property_1	\N	\N	2025-04-22 22:22:23.468437+01	1
3cd24067-d338-4921-86f6-9278f9800291	458146592d9e117b5994027fc5d5bc31dfe2dc203ea376c322e42da5c866bb50	2025-04-22 22:22:23.495331+01	20250227220159_add_property_details_tx	\N	\N	2025-04-22 22:22:23.46981+01	1
ce4e1d38-fdb8-4edc-9cb4-6ca7b77a0229	992e85a10ebdecee1faf64b69d8d1d0e10b816306305161f24709f5c5fa82483	2025-04-22 22:22:23.502277+01	20250227220906_add_property_details_tx_1	\N	\N	2025-04-22 22:22:23.495761+01	1
71dc3e41-dcf9-4c0d-bb83-bd237749fab7	ba1e13237544a8dc493981ce3943e387e2792fc339c97e04e786c05b5be1df47	2025-04-22 22:22:23.536463+01	20250311024354_increase_expected_return_precision	\N	\N	2025-04-22 22:22:23.535495+01	1
33b5778d-5f4a-4413-b9e0-d1e8863b0be1	29f5323342b712a4907cea95b1860a16b50a54c4bb6970b183c5e9425f70311d	2025-04-22 22:22:23.509781+01	20250227230357_add_property_images	\N	\N	2025-04-22 22:22:23.502629+01	1
9f5d7474-c33d-44b3-993f-f80db00ee23c	b3184d38b2a0774a8df7e537dd8d2af91f21772a3fd66c711a534561e0a8ec81	2025-04-22 22:22:23.518022+01	20250227231337_add_investment_models	\N	\N	2025-04-22 22:22:23.510309+01	1
15300d22-cb40-4ffa-9c6a-ced6ded87cb9	ea4291964f882b950dcc231f279bd6aadf66ffc9de396519ddcf765158f197df	2025-04-22 22:22:23.519442+01	20250309141826_add_reset_token_fields	\N	\N	2025-04-22 22:22:23.518415+01	1
9045f112-8b1b-4def-a214-01146089387a	a7716c3f3c909ce70854c32c4b3737597929d12c0e1f4b6a08b808078c09ea5b	2025-04-22 22:22:23.53757+01	20250314000133_add_delivery_pin	\N	\N	2025-04-22 22:22:23.536751+01	1
85e7eb14-c9f3-493c-bca2-8dad79b3e8e6	f31b8d8b8fba9027c3bb6858edba086a1a155723ade7aea21bf6840538878a8f	2025-04-22 22:22:23.522081+01	20250309224442_add_investment_plans	\N	\N	2025-04-22 22:22:23.51976+01	1
739d6410-4a94-422b-8cd1-8ab16b01c724	81303f4187923a261a127107978580601dc7b5e0088ab6c97ee1fe5bf83df4cb	2025-04-22 22:22:23.523263+01	20250309225618_remove_investment_fields_from_property	\N	\N	2025-04-22 22:22:23.522376+01	1
7b70c4a2-6840-4be4-8311-c2cafb02f2cb	fffbc0c520f6550762adafb05293643be03a9fea4cf595b1e7c7de2402e418c7	2025-04-22 22:22:23.5246+01	20250310160908_increase_expected_return_precision	\N	\N	2025-04-22 22:22:23.523525+01	1
e97e8b5d-8a48-4755-b3d2-cc941948d282	2d4191f475173126c18ba78c597967d40fa249bb7f7ae1554d008b457aa58d4d	2025-04-23 00:00:27.733888+01	20250422235434_add_missing_columns	\N	\N	2025-04-23 00:00:27.727399+01	1
bc7204de-dc82-4c0e-b927-c8e693edc075	64e177ef77f6c5806bd507210d092f155bf468d781de3b0f770202a11d0062b7	2025-04-23 00:00:32.826603+01	20250422230032_add_missing_columns	\N	\N	2025-04-23 00:00:32.776235+01	1
\.


--
-- PostgreSQL database dump complete
--

