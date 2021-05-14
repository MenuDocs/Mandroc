-- CreateEnum
CREATE TYPE "InfractionType" AS ENUM ('Warn', 'Ban', 'SoftBan', 'Kick', 'Mute', 'UnBan', 'UnMute', 'Timeout');

-- CreateEnum
CREATE TYPE "BodyguardTier" AS ENUM ('Chad', 'Deluxe', 'Gold', 'Rookie');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('Redeemable', 'Tool', 'Document');

-- CreateEnum
CREATE TYPE "ItemModifier" AS ENUM ('Booster', 'Bodyguard');

-- CreateTable
CREATE TABLE "badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "emoji_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infraction" (
    "id" SERIAL NOT NULL,
    "offender_id" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "message_id" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "InfractionType" NOT NULL,
    "meta" JSONB NOT NULL DEFAULT E'{}',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reaction_role" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "emoji_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "remove_reaction" BOOLEAN NOT NULL,

    PRIMARY KEY ("id","message_id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "contents" TEXT NOT NULL,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT E'general',
    "aliases" TEXT[],
    "croeated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "embedded" BOOLEAN NOT NULL DEFAULT false,
    "support_only" BOOLEAN NOT NULL DEFAULT true,
    "staff_only" BOOLEAN NOT NULL DEFAULT false,
    "allowed_roles" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "pocket" INTEGER NOT NULL DEFAULT 0,
    "bank" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "boosters" JSONB NOT NULL DEFAULT E'{ "xp": null, "coins": null }',
    "badges" TEXT[],
    "bodyguard" "BodyguardTier",
    "reputation" TEXT[],
    "last_robbed" INTEGER,
    "last_daily" INTEGER,
    "last_weekly" INTEGER,
    "last_worked" INTEGER,
    "last_chopped" INTEGER,
    "last_mined" INTEGER,
    "last_fished" INTEGER,
    "last_shoveled" INTEGER,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "notes" JSONB[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_item" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "modifier" "ItemModifier",
    "metadata" JSONB NOT NULL DEFAULT E'{}',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_item" (
    "id" SERIAL NOT NULL,
    "item_id" TEXT NOT NULL,
    "auto_redeem" BOOLEAN NOT NULL,
    "price" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT E'general',

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "inventory_item" ADD FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_item" ADD FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_item" ADD FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
