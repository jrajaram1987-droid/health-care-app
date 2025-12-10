import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware'
import { mockDb } from '@/lib/db/mock-db'

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'pharmacy') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pharmacy = mockDb.pharmacies.findByUserId(user.id)
    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy profile not found' }, { status: 404 })
    }

    const inventory = mockDb.inventory.findByPharmacyId(pharmacy.id)
    
    // Calculate status for each item
    const inventoryWithStatus = inventory.map((item) => {
      let status = 'Good'
      if (item.stock === 0) {
        status = 'Out of Stock'
      } else if (item.stock <= item.low_stock_threshold) {
        status = 'Low'
      }
      return {
        ...item,
        status,
      }
    })

    return NextResponse.json(inventoryWithStatus)
  } catch (error) {
    console.error('Error in GET /api/inventory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user || user.role !== 'pharmacy') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { medicine_name, stock, unit, low_stock_threshold } = body

    if (!medicine_name || stock === undefined) {
      return NextResponse.json(
        { error: 'Medicine name and stock are required' },
        { status: 400 }
      )
    }

    const pharmacy = mockDb.pharmacies.findByUserId(user.id)
    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy profile not found' }, { status: 404 })
    }

    const newItem = await mockDb.inventory.create({
      pharmacy_id: pharmacy.id,
      medicine_name,
      stock: Number(stock),
      unit: unit || 'units',
      low_stock_threshold: low_stock_threshold || 50,
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/inventory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user || user.role !== 'pharmacy') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, medicine_name, stock, unit, low_stock_threshold } = body

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    const pharmacy = mockDb.pharmacies.findByUserId(user.id)
    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy profile not found' }, { status: 404 })
    }

    // Verify the item belongs to this pharmacy
    const item = mockDb.inventory.findById(id)
    if (!item || item.pharmacy_id !== pharmacy.id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const updates: any = {}
    if (medicine_name !== undefined) updates.medicine_name = medicine_name
    if (stock !== undefined) updates.stock = Number(stock)
    if (unit !== undefined) updates.unit = unit
    if (low_stock_threshold !== undefined) updates.low_stock_threshold = Number(low_stock_threshold)

    const updatedItem = await mockDb.inventory.update(id, updates)

    if (!updatedItem) {
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error in PATCH /api/inventory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthUser(request)
    if (!user || user.role !== 'pharmacy') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    const pharmacy = mockDb.pharmacies.findByUserId(user.id)
    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy profile not found' }, { status: 404 })
    }

    // Verify the item belongs to this pharmacy
    const item = mockDb.inventory.findById(id)
    if (!item || item.pharmacy_id !== pharmacy.id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const deleted = await mockDb.inventory.delete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/inventory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

