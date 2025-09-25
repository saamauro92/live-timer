-- Create the rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    "shareToken" UUID UNIQUE DEFAULT gen_random_uuid(),
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create the timers table
CREATE TABLE IF NOT EXISTS timers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "roomId" UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    "startTimestamp" TIMESTAMPTZ NOT NULL,
    "endTimestamp" TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL,
    "isActive" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY ("roomId") REFERENCES rooms(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rooms_share_token ON rooms("shareToken");
CREATE INDEX IF NOT EXISTS idx_rooms_owner_id ON rooms("ownerId");
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms("createdAt");
CREATE INDEX IF NOT EXISTS idx_timers_room_id ON timers("roomId");
CREATE INDEX IF NOT EXISTS idx_timers_is_active ON timers("isActive");
CREATE INDEX IF NOT EXISTS idx_timers_created_at ON timers("createdAt");

