import { Button } from "antd";
import { useCurrent } from "../../hooks/useCurrent";
import { useBase } from "../../hooks/useBase";

export default function NewChapterPanel(props) {
  const { setCurrentChapter, currentVolume } = useCurrent();
  const { title, setShowNewChapterPanel, setShowText } = useBase();
  const [newChapterName, setNewChapterName] = useState("");

  return (
    <div>
      <div className="flex justify-start items-center mb-5">
        <div className="mr-0">章节名称：</div>
        <input
          type="text"
          placeholder="第?章 章节名称"
          className=" border mr-3"
          value={newChapterName}
          onChange={(e) => setNewChapterName(e.target.value)}
        />
        <Button
          type="primary"
          className="bg-blue-500"
          size="small"
          onClick={async () => {
            console.log("添加章节");
            window.ipc.send("create-chapter", {
              bookTitle: title,
              volumeNumber: currentVolume,
              chapterTitle: newChapterName,
            });
            window.ipc.on("create-chapter", (arg) => {
              console.log("create-chapter", arg);
              if (arg.success) {
                console.log("chapters", arg.data);
                setShowNewChapterPanel(false);
                setNewChapterName("");
                setCurrentChapter(arg.data.length.toString());
                setShowText(true);
                setTreeUpdater(Date.now());
              } else {
                console.error("create-chapter", arg);
              }
            });
          }}
        >
          确定
        </Button>
      </div>
    </div>
  );
}
