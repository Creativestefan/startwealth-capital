-- Modified schema dump for Supabase import
-- Remove all ownership statements and set search path to public
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET search_path = public;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Drop all tables first to avoid conflicts (will be recreated with proper relationships)
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "KYC" CASCADE;
DROP TABLE IF EXISTS "Wallet" CASCADE;
DROP TABLE IF EXISTS "WalletTransaction" CASCADE;
DROP TABLE IF EXISTS "Property" CASCADE;
DROP TABLE IF EXISTS "PropertyTransaction" CASCADE;
DROP TABLE IF EXISTS "Equipment" CASCADE;
DROP TABLE IF EXISTS "EquipmentTransaction" CASCADE;
DROP TABLE IF EXISTS "MarketInvestment" CASCADE;
DROP TABLE IF EXISTS "Referral" CASCADE;
DROP TABLE IF EXISTS "ReferralCommission" CASCADE;
DROP TABLE IF EXISTS "ReferralSettings" CASCADE;
DROP TABLE IF EXISTS "WalletSettings" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "PushSubscription" CASCADE;
DROP TABLE IF EXISTS "NotificationPreference" CASCADE;
DROP TABLE IF EXISTS "RealEstateInvestment" CASCADE;
DROP TABLE IF EXISTS "GreenEnergyInvestment" CASCADE;
DROP TABLE IF EXISTS "InvestmentPlan" CASCADE;
DROP TABLE IF EXISTS "GreenEnergyPlan" CASCADE;
DROP TABLE IF EXISTS "MarketInvestmentPlan" CASCADE;
DROP TABLE IF EXISTS "UserActivity" CASCADE;

-- Now import the actual schema from the dump file 

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


CREATE TYPE public."CommissionStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'PAID',
    'REJECTED'
);




CREATE TYPE public."EquipmentStatus" AS ENUM (
    'AVAILABLE',
    'PENDING',
    'SOLD'
);




CREATE TYPE public."EquipmentType" AS ENUM (
    'SOLAR_PANEL',
    'WIND_TURBINE',
    'BATTERY_STORAGE',
    'INVERTER'
);




CREATE TYPE public."GreenEnergyInvestmentType" AS ENUM (
    'SEMI_ANNUAL',
    'ANNUAL'
);




CREATE TYPE public."InvestmentStatus" AS ENUM (
    'ACTIVE',
    'MATURED',
    'CANCELLED'
);




CREATE TYPE public."KycStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);




CREATE TYPE public."MarketPlanType" AS ENUM (
    'SEMI_ANNUAL',
    'ANNUAL'
);




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




CREATE TYPE public."PropertyStatus" AS ENUM (
    'AVAILABLE',
    'PENDING',
    'SOLD'
);




CREATE TYPE public."PropertyTransactionType" AS ENUM (
    'FULL',
    'INSTALLMENT'
);




CREATE TYPE public."RealEstateInvestmentType" AS ENUM (
    'SEMI_ANNUAL',
    'ANNUAL'
);




CREATE TYPE public."ReferralStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'EXPIRED'
);




CREATE TYPE public."ReferralTransactionType" AS ENUM (
    'PROPERTY_PURCHASE',
    'EQUIPMENT_PURCHASE',
    'REAL_ESTATE_INVESTMENT',
    'GREEN_ENERGY_INVESTMENT',
    'MARKET_INVESTMENT'
);




CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);




CREATE TYPE public."TransactionStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'ACCEPTED',
    'PROCESSING',
    'OUT_FOR_DELIVERY'
);




CREATE TYPE public."TransactionType" AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL',
    'INVESTMENT',
    'RETURN',
    'COMMISSION',
    'PAYOUT',
    'PURCHASE'
);



SET default_tablespace = '';

SET default_table_access_method = heap;


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




CREATE TABLE public."PushSubscription" (
    id text NOT NULL,
    "userId" text NOT NULL,
    subscription text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);




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




CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);




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




CREATE TABLE public."Wallet" (
    id text NOT NULL,
    "userId" text NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "btcAddress" text,
    "usdtAddress" text
);




CREATE TABLE public."WalletSettings" (
    id text NOT NULL,
    "btcWalletAddress" text,
    "usdtWalletAddress" text,
    "usdtWalletType" text DEFAULT 'BEP-20'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);




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




ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."EquipmentTransaction"
    ADD CONSTRAINT "EquipmentTransaction_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."Equipment"
    ADD CONSTRAINT "Equipment_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."GreenEnergyInvestment"
    ADD CONSTRAINT "GreenEnergyInvestment_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."GreenEnergyPlan"
    ADD CONSTRAINT "GreenEnergyPlan_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."InvestmentPlan"
    ADD CONSTRAINT "InvestmentPlan_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."MarketInvestmentPlan"
    ADD CONSTRAINT "MarketInvestmentPlan_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."MarketInvestment"
    ADD CONSTRAINT "MarketInvestment_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."NotificationPreference"
    ADD CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."PropertyTransaction"
    ADD CONSTRAINT "PropertyTransaction_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."RealEstateInvestment"
    ADD CONSTRAINT "RealEstateInvestment_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."ReferralSettings"
    ADD CONSTRAINT "ReferralSettings_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."UserActivity"
    ADD CONSTRAINT "UserActivity_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."WalletSettings"
    ADD CONSTRAINT "WalletSettings_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);



CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");



CREATE INDEX "Account_userId_idx" ON public."Account" USING btree ("userId");



CREATE INDEX "EquipmentTransaction_equipmentId_idx" ON public."EquipmentTransaction" USING btree ("equipmentId");



CREATE INDEX "EquipmentTransaction_referralId_idx" ON public."EquipmentTransaction" USING btree ("referralId");



CREATE INDEX "EquipmentTransaction_status_idx" ON public."EquipmentTransaction" USING btree (status);



CREATE INDEX "EquipmentTransaction_userId_idx" ON public."EquipmentTransaction" USING btree ("userId");



CREATE INDEX "Equipment_status_idx" ON public."Equipment" USING btree (status);



CREATE INDEX "Equipment_type_idx" ON public."Equipment" USING btree (type);



CREATE INDEX "GreenEnergyInvestment_planId_idx" ON public."GreenEnergyInvestment" USING btree ("planId");



CREATE INDEX "GreenEnergyInvestment_referralId_idx" ON public."GreenEnergyInvestment" USING btree ("referralId");



CREATE INDEX "GreenEnergyInvestment_status_idx" ON public."GreenEnergyInvestment" USING btree (status);



CREATE INDEX "GreenEnergyInvestment_type_idx" ON public."GreenEnergyInvestment" USING btree (type);



CREATE INDEX "GreenEnergyInvestment_userId_idx" ON public."GreenEnergyInvestment" USING btree ("userId");



CREATE INDEX "GreenEnergyPlan_type_idx" ON public."GreenEnergyPlan" USING btree (type);



CREATE INDEX "InvestmentPlan_type_idx" ON public."InvestmentPlan" USING btree (type);



CREATE INDEX "KYC_status_idx" ON public."KYC" USING btree (status);



CREATE UNIQUE INDEX "KYC_userId_key" ON public."KYC" USING btree ("userId");



CREATE INDEX "MarketInvestmentPlan_type_idx" ON public."MarketInvestmentPlan" USING btree (type);



CREATE INDEX "MarketInvestment_planId_idx" ON public."MarketInvestment" USING btree ("planId");



CREATE INDEX "MarketInvestment_referralId_idx" ON public."MarketInvestment" USING btree ("referralId");



CREATE INDEX "MarketInvestment_userId_idx" ON public."MarketInvestment" USING btree ("userId");



CREATE INDEX "NotificationPreference_userId_idx" ON public."NotificationPreference" USING btree ("userId");



CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON public."NotificationPreference" USING btree ("userId");



CREATE INDEX "Notification_read_idx" ON public."Notification" USING btree (read);



CREATE INDEX "Notification_type_idx" ON public."Notification" USING btree (type);



CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");



CREATE INDEX "PropertyTransaction_propertyId_idx" ON public."PropertyTransaction" USING btree ("propertyId");



CREATE INDEX "PropertyTransaction_referralId_idx" ON public."PropertyTransaction" USING btree ("referralId");



CREATE INDEX "PropertyTransaction_status_idx" ON public."PropertyTransaction" USING btree (status);



CREATE INDEX "PropertyTransaction_userId_idx" ON public."PropertyTransaction" USING btree ("userId");



CREATE INDEX "Property_price_idx" ON public."Property" USING btree (price);



CREATE INDEX "Property_status_idx" ON public."Property" USING btree (status);



CREATE INDEX "PushSubscription_userId_idx" ON public."PushSubscription" USING btree ("userId");



CREATE UNIQUE INDEX "PushSubscription_userId_key" ON public."PushSubscription" USING btree ("userId");



CREATE INDEX "RealEstateInvestment_referralId_idx" ON public."RealEstateInvestment" USING btree ("referralId");



CREATE INDEX "RealEstateInvestment_status_idx" ON public."RealEstateInvestment" USING btree (status);



CREATE INDEX "RealEstateInvestment_type_idx" ON public."RealEstateInvestment" USING btree (type);



CREATE INDEX "RealEstateInvestment_userId_idx" ON public."RealEstateInvestment" USING btree ("userId");



CREATE INDEX "ReferralCommission_equipmentTransactionId_idx" ON public."ReferralCommission" USING btree ("equipmentTransactionId");



CREATE INDEX "ReferralCommission_greenEnergyInvestmentId_idx" ON public."ReferralCommission" USING btree ("greenEnergyInvestmentId");



CREATE INDEX "ReferralCommission_marketInvestmentId_idx" ON public."ReferralCommission" USING btree ("marketInvestmentId");



CREATE INDEX "ReferralCommission_propertyTransactionId_idx" ON public."ReferralCommission" USING btree ("propertyTransactionId");



CREATE INDEX "ReferralCommission_realEstateInvestmentId_idx" ON public."ReferralCommission" USING btree ("realEstateInvestmentId");



CREATE INDEX "ReferralCommission_referralId_idx" ON public."ReferralCommission" USING btree ("referralId");



CREATE INDEX "ReferralCommission_status_idx" ON public."ReferralCommission" USING btree (status);



CREATE INDEX "ReferralCommission_transactionType_idx" ON public."ReferralCommission" USING btree ("transactionType");



CREATE INDEX "ReferralCommission_userId_idx" ON public."ReferralCommission" USING btree ("userId");



CREATE INDEX "Referral_referredId_idx" ON public."Referral" USING btree ("referredId");



CREATE INDEX "Referral_referrerId_idx" ON public."Referral" USING btree ("referrerId");



CREATE INDEX "Referral_status_idx" ON public."Referral" USING btree (status);



CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");



CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");



CREATE INDEX "UserActivity_timestamp_idx" ON public."UserActivity" USING btree ("timestamp");



CREATE INDEX "UserActivity_type_idx" ON public."UserActivity" USING btree (type);



CREATE INDEX "UserActivity_userId_idx" ON public."UserActivity" USING btree ("userId");



CREATE INDEX "User_email_idx" ON public."User" USING btree (email);



CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);



CREATE INDEX "User_referralCode_idx" ON public."User" USING btree ("referralCode");



CREATE UNIQUE INDEX "User_referralCode_key" ON public."User" USING btree ("referralCode");



CREATE INDEX "User_role_idx" ON public."User" USING btree (role);



CREATE INDEX "WalletTransaction_status_idx" ON public."WalletTransaction" USING btree (status);



CREATE INDEX "WalletTransaction_type_idx" ON public."WalletTransaction" USING btree (type);



CREATE INDEX "WalletTransaction_walletId_idx" ON public."WalletTransaction" USING btree ("walletId");



CREATE INDEX "Wallet_userId_idx" ON public."Wallet" USING btree ("userId");



CREATE UNIQUE INDEX "Wallet_userId_key" ON public."Wallet" USING btree ("userId");



ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY public."EquipmentTransaction"
    ADD CONSTRAINT "EquipmentTransaction_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES public."Equipment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."EquipmentTransaction"
    ADD CONSTRAINT "EquipmentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."GreenEnergyInvestment"
    ADD CONSTRAINT "GreenEnergyInvestment_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."GreenEnergyPlan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."GreenEnergyInvestment"
    ADD CONSTRAINT "GreenEnergyInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY public."MarketInvestment"
    ADD CONSTRAINT "MarketInvestment_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."MarketInvestmentPlan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."MarketInvestment"
    ADD CONSTRAINT "MarketInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."NotificationPreference"
    ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."PropertyTransaction"
    ADD CONSTRAINT "PropertyTransaction_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."PropertyTransaction"
    ADD CONSTRAINT "PropertyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY public."RealEstateInvestment"
    ADD CONSTRAINT "RealEstateInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_equipmentTransactionId_fkey" FOREIGN KEY ("equipmentTransactionId") REFERENCES public."EquipmentTransaction"(id) ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_greenEnergyInvestmentId_fkey" FOREIGN KEY ("greenEnergyInvestmentId") REFERENCES public."GreenEnergyInvestment"(id) ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_marketInvestmentId_fkey" FOREIGN KEY ("marketInvestmentId") REFERENCES public."MarketInvestment"(id) ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_propertyTransactionId_fkey" FOREIGN KEY ("propertyTransactionId") REFERENCES public."PropertyTransaction"(id) ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_realEstateInvestmentId_fkey" FOREIGN KEY ("realEstateInvestmentId") REFERENCES public."RealEstateInvestment"(id) ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES public."Referral"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."ReferralCommission"
    ADD CONSTRAINT "ReferralCommission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY public."UserActivity"
    ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY public."WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."Wallet"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;



