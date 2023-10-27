import { useRouter } from 'next/router';

export default function BookInfo(props) {
  const router = useRouter();
  const { title } = router.query;
  return <div className="h-[100vh]">
    {title}
  </div>
}
