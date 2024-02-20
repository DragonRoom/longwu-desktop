'use client';
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
const BookEditor = dynamic(
  () => {
    return import("../../../components/BookEditor");
  },
  { ssr: false }
);

export default function EditBook(props) {
  const router = useRouter();
  return <BookEditor title={router.query} />;
}

