import {
  createFileRoute,
  ErrorComponent,
  ErrorComponentProps,
} from "@tanstack/react-router";
import { Octokit } from "octokit";
import { useEffect, useState } from "react";

export const Route: unknown = createFileRoute("/")({
  component: Index,
  errorComponent: PostErrorComponent,
});

function PostErrorComponent({ error }: ErrorComponentProps) {
  return <ErrorComponent error={error} />;
}
function Index() {
  const [data, setData] = useState<any>([]);

  const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
  });

  const fetchData = async () => {
    try {
      const response = await octokit.rest.issues.listComments({
        owner: "senkenn",
        repo: "sqlsurge",
        issue_number: 1,
      });
      setData(response.data.map((comment) => comment.body));
    } catch (error) {
      console.error("Error fetching data from GitHub:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-2">
      <textarea
        className={
          "border border-gray-300 rounded p-2 font-mono bg-gray-100 w-full"
        }
        value={data}
        readOnly
        rows={10}
        cols={50}
      />{" "}
      <h3>Welcome Home!</h3>
    </div>
  );
}
