import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware'
import { mockDb } from '@/lib/db/mock-db'

let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    await mockDb.messages.initialize()
    initialized = true
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureInitialized()
    
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all messages for this user (sent or received)
    const messages = mockDb.messages.findByUserId(user.id)
    
    // Join with users to include sender_name and receiver_name
    const messagesWithNames = messages.map((msg) => {
      const sender = mockDb.users.findById(msg.sender_id)
      const receiver = mockDb.users.findById(msg.receiver_id)
      return {
        ...msg,
        sender_name: sender?.name || 'Unknown',
        receiver_name: receiver?.name || 'Unknown',
      }
    })

    // Sort by created_at (newest first)
    messagesWithNames.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json(messagesWithNames)
  } catch (error) {
    console.error('Error in GET /api/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized()
    
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { receiver_id, message } = body

    if (!receiver_id || !message?.trim()) {
      return NextResponse.json(
        { error: 'Receiver ID and message are required' },
        { status: 400 }
      )
    }

    const newMessage = await mockDb.messages.create({
      sender_id: user.id,
      receiver_id,
      message: message.trim(),
    })

    // Join with users to include sender_name and receiver_name
    const sender = mockDb.users.findById(newMessage.sender_id)
    const receiver = mockDb.users.findById(newMessage.receiver_id)

    return NextResponse.json({
      ...newMessage,
      sender_name: sender?.name || 'Unknown',
      receiver_name: receiver?.name || 'Unknown',
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
