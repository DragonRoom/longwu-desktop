
const saveCoverImage = (imageSrc, title='') => {
  if (typeof window === 'undefined') return;
  const isBase64 = (str) => {
      try {
          return btoa(atob(str)) === str;
      } catch (err) {
          return false;
      }
  };

  // 创建一个a标签用于下载
  const link = window.document.createElement("a");

  if (isBase64(imageSrc)) {
      // 处理Base64编码的图片
      const byteCharacters = atob(imageSrc.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' }); // 设定为'image/jpeg'，您也可以根据实际情况进行修改
      link.href = URL.createObjectURL(blob);
  } else {
      // 直接使用URL
      link.href = imageSrc;
  }

  // 设置下载的文件名，可根据需要进行修改
  link.download = title + "cover-image.jpg";

  // 触发下载
  link.click();

  // 清除创建的元素
  link.remove();

  console.log("保存封面图片");
};

export default function ClientButton({ children, ...props }) {
  return (
    <div className='bg-gray-100 bg-opacity-80 drop-shadow-2xl shadow-lg p-2 rounded-2xl mt-2 z-10 cursor-pointer text-center' onClick={()=>{
      if (typeof window !== 'undefined') {
        saveCoverImage(cover, title);
      }
    }}>
      {children}
    </div>
  );
}
