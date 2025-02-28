import { SubmitButton } from "./SubmitButton";
import { IssueParams } from "./IssueComments";

interface IssueFormProps {
  action: (formData: FormData) => void;
  data: IssueParams;
}

export function IssueForm({ action, data }: IssueFormProps) {
  const { owner, repo, issueNumber } = data;

  return (
    <form action={action} className="p-2 flex flex-wrap gap-2 items-center">
      <input
        type="text"
        placeholder="Enter Owner (e.g. user)"
        className="border border-gray-300 rounded p-2 mb-2 flex-grow"
        name="owner"
        defaultValue={owner}
      />
      <input
        type="text"
        placeholder="Enter Repo (e.g. repo)"
        className="border border-gray-300 rounded p-2 mb-2 flex-grow"
        name="repo"
        defaultValue={repo}
      />
      <input
        type="text"
        placeholder="Enter Issue Number (e.g. 1)"
        className="border border-gray-300 rounded p-2 mb-2 flex-grow"
        name="issueNumber"
        defaultValue={issueNumber}
      />
      <SubmitButton className="flex-grow mb-2 min-w-[100px]" />
    </form>
  );
}
