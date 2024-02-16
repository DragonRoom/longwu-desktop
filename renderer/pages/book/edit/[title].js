'use client';
import { useRouter } from "next/router";

import BookEditor from '../../../components/BookEditor';

export default function EditBook(props) {
  const router = useRouter();
  return <BookEditor title={router.query} />;
}

