import Image from "next/image";
import { Inter } from "next/font/google";
import Dropzone from "../components/Dropzone";
import CurrentFiles from "../components/CurrentFiles";
import { useEffect, useState } from "react";
import * as api from "../shared/client/api";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [files, setFiles] = useState<Array<string>>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    setLoading(true)
    const res = await api.getFiles();
    setFiles(res.data.files);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  if (loading) {
    return (
      <div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <h1>Default Folders App</h1>
      <Dropzone existingFiles={files} fetchFiles={fetchFiles} />
      <CurrentFiles files={files} />
    </div>
  );
}
