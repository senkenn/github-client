export type IssueParams = {
  owner: string;
  repo: string;
  number: string;
  body: string;
  comments: string[];
  error?: Error;
};

interface IssueCommentsProps {
  data: IssueParams;
}

export function IssueComments({ data }: IssueCommentsProps) {
  const {
    owner,
    repo,
    number: issueNumber,
    body: issueBody,
    comments: issueComments,
    error,
  } = data;

  return (
    <>
      {/** Error message */}
      {error && <div className="p-2">Error: {error.message}</div>}

      {/** Issue URL */}
      {owner && repo && issueNumber && (
        <div className="p-2">
          URL:
          <a
            href={`https://github.com/${owner}/${repo}/issues/${issueNumber}`}
            className="p-2 text-blue-500 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {`https://github.com/${owner}/${repo}/issues/${issueNumber}`}
          </a>
        </div>
      )}

      {/** Issue body */}
      {issueBody && (
        <div className="border border-gray-300 rounded m-2 p-2 font-mono bg-gray-100 w-full whitespace-pre-wrap">
          {issueBody}
        </div>
      )}

      {/** Issue comments */}
      {issueComments.map((comment, index) => (
        <div
          contentEditable="true"
          key={index}
          className="border border-gray-300 rounded m-2 p-2 font-mono bg-gray-100 w-full whitespace-pre-wrap"
          suppressContentEditableWarning={true}
        >
          {comment}
        </div>
      ))}
    </>
  );
}
