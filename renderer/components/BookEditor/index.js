import { HoxRoot } from 'hox';
import BookEditor from './BookEditor';

export default function BookEditorRoot(props) {
  return (
    <HoxRoot>
      <BookEditor {...props} />
    </HoxRoot>
  );
}
