import { NextResponse } from 'next/server';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

const COLLECTION = 'joiningLetters';

// Generate letter number: JL-2026-0001
async function generateLetterNumber() {
  const snap = await getDocs(collection(db, COLLECTION));
  const count = snap.size + 1;
  const year = new Date().getFullYear();
  return `JL-${year}-${String(count).padStart(4, '0')}`;
}

// GET  /api/joining-letters          → all letters
// GET  /api/joining-letters?id=xxx   → single letter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const ref = doc(db, COLLECTION, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return NextResponse.json({ success: false, message: 'Letter not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: { id: snap.id, ...snap.data() } });
    }

    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('GET joining-letters error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST /api/joining-letters  → create letter
export async function POST(request) {
  try {
    const body = await request.json();
    const letterNumber = await generateLetterNumber();

    const payload = {
      ...body,
      letterNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, COLLECTION), payload);
    return NextResponse.json({ success: true, data: { id: ref.id, letterNumber } }, { status: 201 });
  } catch (err) {
    console.error('POST joining-letters error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT /api/joining-letters?id=xxx  → update letter
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    const body = await request.json();
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, { ...body, updatedAt: serverTimestamp() });
    return NextResponse.json({ success: true, message: 'Updated successfully' });
  } catch (err) {
    console.error('PUT joining-letters error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE /api/joining-letters?id=xxx  → delete letter
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    await deleteDoc(doc(db, COLLECTION, id));
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    console.error('DELETE joining-letters error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
