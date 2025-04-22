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
-- Name: CommissionStatus; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."CommissionStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'PAID',
    'REJECTED'
);


ALTER TYPE public."CommissionStatus" OWNER TO startwealth;

--
-- Name: EquipmentStatus; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."EquipmentStatus" AS ENUM (
    'AVAILABLE',
    'PENDING',
    'SOLD'
);


ALTER TYPE public."EquipmentStatus" OWNER TO startwealth;

--
-- Name: EquipmentType; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."EquipmentType" AS ENUM (
    'SOLAR_PANEL',
    'WIND_TURBINE',
    'BATTERY_STORAGE',
    'INVERTER'
);


ALTER TYPE public."EquipmentType" OWNER TO startwealth;

--
-- Name: GreenEnergyInvestmentType; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."GreenEnergyInvestmentType" AS ENUM (
    'SEMI_ANNUAL',
    'ANNUAL'
);


ALTER TYPE public."GreenEnergyInvestmentType" OWNER TO startwealth;

--
-- Name: InvestmentStatus; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."InvestmentStatus" AS ENUM (
    'ACTIVE',
    'MATURED',
    'CANCELLED'
);


ALTER TYPE public."InvestmentStatus" OWNER TO startwealth;

--
-- Name: KycStatus; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."KycStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."KycStatus" OWNER TO startwealth;

--
-- Name: MarketPlanType; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."MarketPlanType" AS ENUM (
    'SEMI_ANNUAL',
    'ANNUAL'
);


ALTER TYPE public."MarketPlanType" OWNER TO startwealth;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."NotificationType" AS ENUM (
    'INVESTMENT_MATURED',
    'PAYMENT_DUE',
    'KYC_STATUS',
    'SYSTEM_UPDATE',
    'REFERRAL_COMPLETED',
    'WALLET_UPDATED',
    'COMMISSION_EARNED',
    'COMMISSION_PAID',
    'ADMIN_ALERT',
    'PASSWORD_CHANGED',
    'PROFILE_UPDATED'
);


ALTER TYPE public."NotificationType" OWNER TO startwealth;

--
-- Name: PropertyStatus; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."PropertyStatus" AS ENUM (
    'AVAILABLE',
    'PENDING',
    'SOLD'
);


ALTER TYPE public."PropertyStatus" OWNER TO startwealth;

--
-- Name: PropertyTransactionType; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."PropertyTransactionType" AS ENUM (
    'FULL',
    'INSTALLMENT'
);


ALTER TYPE public."PropertyTransactionType" OWNER TO startwealth;

--
-- Name: RealEstateInvestmentType; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."RealEstateInvestmentType" AS ENUM (
    'SEMI_ANNUAL',
    'ANNUAL'
);


ALTER TYPE public."RealEstateInvestmentType" OWNER TO startwealth;

--
-- Name: ReferralStatus; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."ReferralStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'EXPIRED'
);


ALTER TYPE public."ReferralStatus" OWNER TO startwealth;

--
-- Name: ReferralTransactionType; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."ReferralTransactionType" AS ENUM (
    'PROPERTY_PURCHASE',
    'EQUIPMENT_PURCHASE',
    'REAL_ESTATE_INVESTMENT',
    'GREEN_ENERGY_INVESTMENT',
    'MARKET_INVESTMENT'
);


ALTER TYPE public."ReferralTransactionType" OWNER TO startwealth;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO startwealth;

--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'ACCEPTED',
    'PROCESSING',
    'OUT_FOR_DELIVERY'
);


ALTER TYPE public."TransactionStatus" OWNER TO startwealth;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: startwealth
--

CREATE TYPE public."TransactionType" AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL',
    'INVESTMENT',
    'RETURN',
    'COMMISSION',
    'PAYOUT',
    'PURCHASE'
);


ALTER TYPE public."TransactionType" OWNER TO startwealth;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO startwealth;

--
-- Name: Equipment; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."Equipment" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    type public."EquipmentType" NOT NULL,
    price numeric(10,2) NOT NULL,
    status public."EquipmentStatus" DEFAULT 'AVAILABLE'::public."EquipmentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    features jsonb NOT NULL,
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    images jsonb NOT NULL
);


ALTER TABLE public."Equipment" OWNER TO startwealth;

--
-- Name: EquipmentTransaction; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."EquipmentTransaction" (
    id text NOT NULL,
    "equipmentId" text NOT NULL,
    "userId" text NOT NULL,
    status public."TransactionStatus" DEFAULT 'PENDING'::public."TransactionStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "trackingNumber" text,
    "deliveryDate" timestamp(3) without time zone,
    "totalAmount" numeric(10,2) NOT NULL,
    "deliveryAddress" jsonb,
    "deliveryPin" text,
    "commissionAmount" numeric(10,2),
    "commissionPaid" boolean DEFAULT false NOT NULL,
    "referralId" text
);


ALTER TABLE public."EquipmentTransaction" OWNER TO startwealth;

--
-- Name: GreenEnergyInvestment; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."GreenEnergyInvestment" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."GreenEnergyInvestmentType" NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public."InvestmentStatus" DEFAULT 'ACTIVE'::public."InvestmentStatus" NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    "expectedReturn" numeric(10,2) NOT NULL,
    "actualReturn" numeric(10,2),
    reinvest boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "planId" text NOT NULL,
    "commissionAmount" numeric(10,2),
    "commissionPaid" boolean DEFAULT false NOT NULL,
    "referralId" text
);


ALTER TABLE public."GreenEnergyInvestment" OWNER TO startwealth;

--
-- Name: GreenEnergyPlan; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."GreenEnergyPlan" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    type public."GreenEnergyInvestmentType" NOT NULL,
    "minAmount" numeric(10,2) NOT NULL,
    "maxAmount" numeric(10,2) NOT NULL,
    "returnRate" numeric(5,2) NOT NULL,
    "durationMonths" integer DEFAULT 6 NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GreenEnergyPlan" OWNER TO startwealth;

--
-- Name: InvestmentPlan; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."InvestmentPlan" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    type public."RealEstateInvestmentType" NOT NULL,
    "minAmount" numeric(10,2) NOT NULL,
    "maxAmount" numeric(10,2) NOT NULL,
    "returnRate" numeric(5,2) NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "durationMonths" integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."InvestmentPlan" OWNER TO startwealth;

--
-- Name: KYC; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."KYC" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status public."KycStatus" DEFAULT 'PENDING'::public."KycStatus" NOT NULL,
    country text NOT NULL,
    "documentType" text NOT NULL,
    "documentNumber" text,
    "documentImage" text NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "reviewedBy" text
);


ALTER TABLE public."KYC" OWNER TO startwealth;

--
-- Name: MarketInvestment; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."MarketInvestment" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "expectedReturn" numeric(10,2) NOT NULL,
    "actualReturn" numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    reinvest boolean DEFAULT false NOT NULL,
    status public."InvestmentStatus" DEFAULT 'ACTIVE'::public."InvestmentStatus" NOT NULL,
    "commissionAmount" numeric(10,2),
    "commissionPaid" boolean DEFAULT false NOT NULL,
    "planId" text NOT NULL,
    "referralId" text
);


ALTER TABLE public."MarketInvestment" OWNER TO startwealth;

--
-- Name: MarketInvestmentPlan; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."MarketInvestmentPlan" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    type public."MarketPlanType" NOT NULL,
    "minAmount" numeric(10,2) NOT NULL,
    "maxAmount" numeric(10,2) NOT NULL,
    "returnRate" numeric(5,2) NOT NULL,
    "durationMonths" integer DEFAULT 6 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MarketInvestmentPlan" OWNER TO startwealth;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "actionUrl" text
);


ALTER TABLE public."Notification" OWNER TO startwealth;

--
-- Name: NotificationPreference; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."NotificationPreference" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "emailEnabled" boolean DEFAULT true NOT NULL,
    "pushEnabled" boolean DEFAULT true NOT NULL,
    "investmentNotifications" boolean DEFAULT true NOT NULL,
    "paymentNotifications" boolean DEFAULT true NOT NULL,
    "kycNotifications" boolean DEFAULT true NOT NULL,
    "referralNotifications" boolean DEFAULT true NOT NULL,
    "walletNotifications" boolean DEFAULT true NOT NULL,
    "systemNotifications" boolean DEFAULT true NOT NULL,
    "commissionNotifications" boolean DEFAULT true NOT NULL,
    "securityNotifications" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."NotificationPreference" OWNER TO startwealth;

--
-- Name: Property; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."Property" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    location text NOT NULL,
    "mapUrl" text,
    features jsonb NOT NULL,
    images text[],
    status public."PropertyStatus" DEFAULT 'AVAILABLE'::public."PropertyStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "mainImage" text NOT NULL
);


ALTER TABLE public."Property" OWNER TO startwealth;

--
-- Name: PropertyTransaction; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."PropertyTransaction" (
    id text NOT NULL,
    "propertyId" text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    type public."PropertyTransactionType" NOT NULL,
    status public."TransactionStatus" NOT NULL,
    installments integer,
    "installmentAmount" numeric(10,2),
    "nextPaymentDue" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paidInstallments" integer DEFAULT 0 NOT NULL,
    "commissionAmount" numeric(10,2),
    "commissionPaid" boolean DEFAULT false NOT NULL,
    "referralId" text
);


ALTER TABLE public."PropertyTransaction" OWNER TO startwealth;

--
-- Name: PushSubscription; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."PushSubscription" (
    id text NOT NULL,
    "userId" text NOT NULL,
    subscription text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PushSubscription" OWNER TO startwealth;

--
-- Name: RealEstateInvestment; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."RealEstateInvestment" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."RealEstateInvestmentType" NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public."InvestmentStatus" DEFAULT 'ACTIVE'::public."InvestmentStatus" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "expectedReturn" numeric(10,2) NOT NULL,
    "actualReturn" numeric(10,2),
    reinvest boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "commissionAmount" numeric(10,2),
    "commissionPaid" boolean DEFAULT false NOT NULL,
    "referralId" text
);


ALTER TABLE public."RealEstateInvestment" OWNER TO startwealth;

--
-- Name: Referral; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."Referral" (
    id text NOT NULL,
    "referrerId" text NOT NULL,
    "referredId" text NOT NULL,
    commission double precision NOT NULL,
    status public."ReferralStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "commissionPaid" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Referral" OWNER TO startwealth;

--
-- Name: ReferralCommission; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."ReferralCommission" (
    id text NOT NULL,
    "referralId" text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public."CommissionStatus" DEFAULT 'PENDING'::public."CommissionStatus" NOT NULL,
    "transactionType" public."ReferralTransactionType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "propertyTransactionId" text,
    "equipmentTransactionId" text,
    "marketInvestmentId" text,
    "realEstateInvestmentId" text,
    "greenEnergyInvestmentId" text
);


ALTER TABLE public."ReferralCommission" OWNER TO startwealth;

--
-- Name: ReferralSettings; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."ReferralSettings" (
    id text NOT NULL,
    "propertyCommissionRate" numeric(5,2) DEFAULT 0 NOT NULL,
    "equipmentCommissionRate" numeric(5,2) DEFAULT 0 NOT NULL,
    "marketCommissionRate" numeric(5,2) DEFAULT 0 NOT NULL,
    "greenEnergyCommissionRate" numeric(5,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."ReferralSettings" OWNER TO startwealth;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO startwealth;

--
-- Name: User; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    "verificationToken" text,
    "verificationExpires" timestamp(3) without time zone,
    image text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "resetToken" text,
    "resetTokenExpires" timestamp(3) without time zone,
    "isBanned" boolean DEFAULT false NOT NULL,
    "resetOtp" text,
    "resetOtpExpires" timestamp(3) without time zone,
    "referralCode" text
);


ALTER TABLE public."User" OWNER TO startwealth;

--
-- Name: UserActivity; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."UserActivity" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    status text,
    amount double precision,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb
);


ALTER TABLE public."UserActivity" OWNER TO startwealth;

--
-- Name: Wallet; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."Wallet" (
    id text NOT NULL,
    "userId" text NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "btcAddress" text,
    "usdtAddress" text
);


ALTER TABLE public."Wallet" OWNER TO startwealth;

--
-- Name: WalletSettings; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."WalletSettings" (
    id text NOT NULL,
    "btcWalletAddress" text,
    "usdtWalletAddress" text,
    "usdtWalletType" text DEFAULT 'BEP-20'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WalletSettings" OWNER TO startwealth;

--
-- Name: WalletTransaction; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public."WalletTransaction" (
    id text NOT NULL,
    "walletId" text NOT NULL,
    type public."TransactionType" NOT NULL,
    amount double precision NOT NULL,
    status public."TransactionStatus" NOT NULL,
    "cryptoType" text NOT NULL,
    "txHash" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text
);


ALTER TABLE public."WalletTransaction" OWNER TO startwealth;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: startwealth
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO startwealth;

--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: EquipmentTransaction EquipmentTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."EquipmentTransaction"
    ADD CONSTRAINT "EquipmentTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Equipment Equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Equipment"
    ADD CONSTRAINT "Equipment_pkey" PRIMARY KEY (id);


--
-- Name: GreenEnergyInvestment GreenEnergyInvestment_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."GreenEnergyInvestment"
    ADD CONSTRAINT "GreenEnergyInvestment_pkey" PRIMARY KEY (id);


--
-- Name: GreenEnergyPlan GreenEnergyPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."GreenEnergyPlan"
    ADD CONSTRAINT "GreenEnergyPlan_pkey" PRIMARY KEY (id);


--
-- Name: InvestmentPlan InvestmentPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."InvestmentPlan"
    ADD CONSTRAINT "InvestmentPlan_pkey" PRIMARY KEY (id);


--
-- Name: KYC KYC_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_pkey" PRIMARY KEY (id);


--
-- Name: MarketInvestmentPlan MarketInvestmentPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."MarketInvestmentPlan"
    ADD CONSTRAINT "MarketInvestmentPlan_pkey" PRIMARY KEY (id);


--
-- Name: MarketInvestment MarketInvestment_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."MarketInvestment"
    ADD CONSTRAINT "MarketInvestment_pkey" PRIMARY KEY (id);


--
-- Name: NotificationPreference NotificationPreference_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."NotificationPreference"
    ADD CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PropertyTransaction PropertyTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."PropertyTransaction"
    ADD CONSTRAINT "PropertyTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Property Property_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_pkey" PRIMARY KEY (id);


--
-- Name: PushSubscription PushSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_pkey" PRIMARY KEY (id);


--
-- Name: RealEstateInvestment RealEstateInvestment_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."RealEstateInvestment"
    ADD CONSTRAINT "RealEstateInvestment_pkey" PRIMARY KEY (id);


--
-- Name: ReferralCommission ReferralCommission_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_pkey" PRIMARY KEY (id);


--
-- Name: ReferralSettings ReferralSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."ReferralSettings"
    ADD CONSTRAINT "ReferralSettings_pkey" PRIMARY KEY (id);


--
-- Name: Referral Referral_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: UserActivity UserActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."UserActivity"
    ADD CONSTRAINT "UserActivity_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WalletSettings WalletSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."WalletSettings"
    ADD CONSTRAINT "WalletSettings_pkey" PRIMARY KEY (id);


--
-- Name: WalletTransaction WalletTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Wallet Wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Account_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Account_userId_idx" ON public."Account" USING btree ("userId");


--
-- Name: EquipmentTransaction_equipmentId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "EquipmentTransaction_equipmentId_idx" ON public."EquipmentTransaction" USING btree ("equipmentId");


--
-- Name: EquipmentTransaction_referralId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "EquipmentTransaction_referralId_idx" ON public."EquipmentTransaction" USING btree ("referralId");


--
-- Name: EquipmentTransaction_status_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "EquipmentTransaction_status_idx" ON public."EquipmentTransaction" USING btree (status);


--
-- Name: EquipmentTransaction_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "EquipmentTransaction_userId_idx" ON public."EquipmentTransaction" USING btree ("userId");


--
-- Name: Equipment_status_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Equipment_status_idx" ON public."Equipment" USING btree (status);


--
-- Name: Equipment_type_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Equipment_type_idx" ON public."Equipment" USING btree (type);


--
-- Name: GreenEnergyInvestment_planId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "GreenEnergyInvestment_planId_idx" ON public."GreenEnergyInvestment" USING btree ("planId");


--
-- Name: GreenEnergyInvestment_referralId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "GreenEnergyInvestment_referralId_idx" ON public."GreenEnergyInvestment" USING btree ("referralId");


--
-- Name: GreenEnergyInvestment_status_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "GreenEnergyInvestment_status_idx" ON public."GreenEnergyInvestment" USING btree (status);


--
-- Name: GreenEnergyInvestment_type_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "GreenEnergyInvestment_type_idx" ON public."GreenEnergyInvestment" USING btree (type);


--
-- Name: GreenEnergyInvestment_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "GreenEnergyInvestment_userId_idx" ON public."GreenEnergyInvestment" USING btree ("userId");


--
-- Name: GreenEnergyPlan_type_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "GreenEnergyPlan_type_idx" ON public."GreenEnergyPlan" USING btree (type);


--
-- Name: InvestmentPlan_type_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "InvestmentPlan_type_idx" ON public."InvestmentPlan" USING btree (type);


--
-- Name: KYC_status_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "KYC_status_idx" ON public."KYC" USING btree (status);


--
-- Name: KYC_userId_key; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE UNIQUE INDEX "KYC_userId_key" ON public."KYC" USING btree ("userId");


--
-- Name: MarketInvestmentPlan_type_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "MarketInvestmentPlan_type_idx" ON public."MarketInvestmentPlan" USING btree (type);


--
-- Name: MarketInvestment_planId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "MarketInvestment_planId_idx" ON public."MarketInvestment" USING btree ("planId");


--
-- Name: MarketInvestment_referralId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "MarketInvestment_referralId_idx" ON public."MarketInvestment" USING btree ("referralId");


--
-- Name: MarketInvestment_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "MarketInvestment_userId_idx" ON public."MarketInvestment" USING btree ("userId");


--
-- Name: NotificationPreference_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "NotificationPreference_userId_idx" ON public."NotificationPreference" USING btree ("userId");


--
-- Name: NotificationPreference_userId_key; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON public."NotificationPreference" USING btree ("userId");


--
-- Name: Notification_read_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Notification_read_idx" ON public."Notification" USING btree (read);


--
-- Name: Notification_type_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Notification_type_idx" ON public."Notification" USING btree (type);


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: PropertyTransaction_propertyId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "PropertyTransaction_propertyId_idx" ON public."PropertyTransaction" USING btree ("propertyId");


--
-- Name: PropertyTransaction_referralId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "PropertyTransaction_referralId_idx" ON public."PropertyTransaction" USING btree ("referralId");


--
-- Name: PropertyTransaction_status_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "PropertyTransaction_status_idx" ON public."PropertyTransaction" USING btree (status);


--
-- Name: PropertyTransaction_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "PropertyTransaction_userId_idx" ON public."PropertyTransaction" USING btree ("userId");


--
-- Name: Property_price_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Property_price_idx" ON public."Property" USING btree (price);


--
-- Name: Property_status_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Property_status_idx" ON public."Property" USING btree (status);


--
-- Name: PushSubscription_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "PushSubscription_userId_idx" ON public."PushSubscription" USING btree ("userId");


--
-- Name: PushSubscription_userId_key; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE UNIQUE INDEX "PushSubscription_userId_key" ON public."PushSubscription" USING btree ("userId");


--
-- Name: RealEstateInvestment_referralId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "RealEstateInvestment_referralId_idx" ON public."RealEstateInvestment" USING btree ("referralId");


--
-- Name: RealEstateInvestment_status_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "RealEstateInvestment_status_idx" ON public."RealEstateInvestment" USING btree (status);


--
-- Name: RealEstateInvestment_type_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "RealEstateInvestment_type_idx" ON public."RealEstateInvestment" USING btree (type);


--
-- Name: RealEstateInvestment_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "RealEstateInvestment_userId_idx" ON public."RealEstateInvestment" USING btree ("userId");


--
-- Name: ReferralCommission_equipmentTransactionId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "ReferralCommission_equipmentTransactionId_idx" ON public."ReferralCommission" USING btree ("equipmentTransactionId");


--
-- Name: ReferralCommission_greenEnergyInvestmentId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "ReferralCommission_greenEnergyInvestmentId_idx" ON public."ReferralCommission" USING btree ("greenEnergyInvestmentId");


--
-- Name: ReferralCommission_marketInvestmentId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "ReferralCommission_marketInvestmentId_idx" ON public."ReferralCommission" USING btree ("marketInvestmentId");


--
-- Name: ReferralCommission_propertyTransactionId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "ReferralCommission_propertyTransactionId_idx" ON public."ReferralCommission" USING btree ("propertyTransactionId");


--
-- Name: ReferralCommission_realEstateInvestmentId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "ReferralCommission_realEstateInvestmentId_idx" ON public."ReferralCommission" USING btree ("realEstateInvestmentId");


--
-- Name: ReferralCommission_referralId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "ReferralCommission_referralId_idx" ON public."ReferralCommission" USING btree ("referralId");


--
-- Name: ReferralCommission_status_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "ReferralCommission_status_idx" ON public."ReferralCommission" USING btree (status);


--
-- Name: ReferralCommission_transactionType_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "ReferralCommission_transactionType_idx" ON public."ReferralCommission" USING btree ("transactionType");


--
-- Name: ReferralCommission_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "ReferralCommission_userId_idx" ON public."ReferralCommission" USING btree ("userId");


--
-- Name: Referral_referredId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Referral_referredId_idx" ON public."Referral" USING btree ("referredId");


--
-- Name: Referral_referrerId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Referral_referrerId_idx" ON public."Referral" USING btree ("referrerId");


--
-- Name: Referral_status_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Referral_status_idx" ON public."Referral" USING btree (status);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: UserActivity_timestamp_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "UserActivity_timestamp_idx" ON public."UserActivity" USING btree ("timestamp");


--
-- Name: UserActivity_type_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "UserActivity_type_idx" ON public."UserActivity" USING btree (type);


--
-- Name: UserActivity_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "UserActivity_userId_idx" ON public."UserActivity" USING btree ("userId");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_referralCode_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "User_referralCode_idx" ON public."User" USING btree ("referralCode");


--
-- Name: User_referralCode_key; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE UNIQUE INDEX "User_referralCode_key" ON public."User" USING btree ("referralCode");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: WalletTransaction_status_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "WalletTransaction_status_idx" ON public."WalletTransaction" USING btree (status);


--
-- Name: WalletTransaction_type_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "WalletTransaction_type_idx" ON public."WalletTransaction" USING btree (type);


--
-- Name: WalletTransaction_walletId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "WalletTransaction_walletId_idx" ON public."WalletTransaction" USING btree ("walletId");


--
-- Name: Wallet_userId_idx; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE INDEX "Wallet_userId_idx" ON public."Wallet" USING btree ("userId");


--
-- Name: Wallet_userId_key; Type: INDEX; Schema: public; Owner: startwealth
--

CREATE UNIQUE INDEX "Wallet_userId_key" ON public."Wallet" USING btree ("userId");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EquipmentTransaction EquipmentTransaction_equipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."EquipmentTransaction"
    ADD CONSTRAINT "EquipmentTransaction_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES public."Equipment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EquipmentTransaction EquipmentTransaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."EquipmentTransaction"
    ADD CONSTRAINT "EquipmentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GreenEnergyInvestment GreenEnergyInvestment_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."GreenEnergyInvestment"
    ADD CONSTRAINT "GreenEnergyInvestment_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."GreenEnergyPlan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GreenEnergyInvestment GreenEnergyInvestment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."GreenEnergyInvestment"
    ADD CONSTRAINT "GreenEnergyInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KYC KYC_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MarketInvestment MarketInvestment_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."MarketInvestment"
    ADD CONSTRAINT "MarketInvestment_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."MarketInvestmentPlan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MarketInvestment MarketInvestment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."MarketInvestment"
    ADD CONSTRAINT "MarketInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: NotificationPreference NotificationPreference_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."NotificationPreference"
    ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PropertyTransaction PropertyTransaction_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."PropertyTransaction"
    ADD CONSTRAINT "PropertyTransaction_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PropertyTransaction PropertyTransaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."PropertyTransaction"
    ADD CONSTRAINT "PropertyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PushSubscription PushSubscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RealEstateInvestment RealEstateInvestment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."RealEstateInvestment"
    ADD CONSTRAINT "RealEstateInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReferralCommission ReferralCommission_equipmentTransactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_equipmentTransactionId_fkey" FOREIGN KEY ("equipmentTransactionId") REFERENCES public."EquipmentTransaction"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReferralCommission ReferralCommission_greenEnergyInvestmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_greenEnergyInvestmentId_fkey" FOREIGN KEY ("greenEnergyInvestmentId") REFERENCES public."GreenEnergyInvestment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReferralCommission ReferralCommission_marketInvestmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_marketInvestmentId_fkey" FOREIGN KEY ("marketInvestmentId") REFERENCES public."MarketInvestment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReferralCommission ReferralCommission_propertyTransactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_propertyTransactionId_fkey" FOREIGN KEY ("propertyTransactionId") REFERENCES public."PropertyTransaction"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReferralCommission ReferralCommission_realEstateInvestmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_realEstateInvestmentId_fkey" FOREIGN KEY ("realEstateInvestmentId") REFERENCES public."RealEstateInvestment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReferralCommission ReferralCommission_referralId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES public."Referral"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReferralCommission ReferralCommission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Referral Referral_referredId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Referral Referral_referrerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserActivity UserActivity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."UserActivity"
    ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WalletTransaction WalletTransaction_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."Wallet"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wallet Wallet_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: startwealth
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

