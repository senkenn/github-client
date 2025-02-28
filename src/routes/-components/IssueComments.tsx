type Ok = {
  isOk: true;
  issueComments: string[];
};

type Err = {
  isOk: false;
  error: Error;
};

export type IssueParams = {
  owner: string;
  repo: string;
  issueNumber: string;
  result: Ok | Err;
};

interface IssueCommentsProps {
  data: IssueParams;
}

export function IssueComments({ data }: IssueCommentsProps) {
  const { owner, repo, issueNumber, result } = data;

  return (
    <>
      {!result.isOk ? (
        <div className="p-2">Error: {result.error.message}</div>
      ) : (
        <>
          {owner && repo && issueNumber && (
            <a
              href={`https://github.com/${owner}/${repo}/issues/${issueNumber}`}
              className="p-2 text-blue-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {`https://github.com/${owner}/${repo}/issues/${issueNumber}`}
            </a>
          )}
          {result.issueComments.map((comment, index) => {
            return (
              <div
                contentEditable="true"
                key={index}
                className="border border-gray-300 rounded m-2 p-2 font-mono bg-gray-100 w-full whitespace-pre-wrap"
                suppressContentEditableWarning={true}
              >
                {comment}
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
