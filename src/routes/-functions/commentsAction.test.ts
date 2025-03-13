import { fetchCommentsAction } from "./commentsAction";
import { Octokit } from "octokit";

vi.mock(import("octokit"), () => {
  const Octokit = vi.fn();
  Octokit.prototype.rest = {
    issues: {
      get: vi.fn(),
      listComments: vi.fn(),
    },
  };
  return { Octokit } as any;
});

describe("fetchCommentsAction", () => {
  it("should fetch issue body and comments successfully", async () => {
    // mock
    const octokit = new Octokit();
    const mockIssuesGet = vi
      .spyOn(octokit.rest.issues, "get")
      .mockResolvedValueOnce({
        data: {
          body: "This is a test issue body",
        },
      } as any);
    const mockIssuesListComments = vi
      .spyOn(octokit.rest.issues, "listComments")
      .mockResolvedValueOnce({
        data: [
          {
            body: "This is a test comment",
          },
          {
            body: "This is another test comment",
          },
        ],
      } as any);
    const formData = new FormData();
    formData.append("owner", "testOwner");
    formData.append("repo", "testRepo");
    formData.append("issueNumber", "123");
    const expectedResult = {
      owner: "testOwner",
      repo: "testRepo",
      number: "123",
      body: "This is a test issue body",
      comments: ["This is a test comment", "This is another test comment"],
    };

    // call
    const result = await fetchCommentsAction({} as any, formData as any);

    // assert
    expect(result).toEqual(expectedResult);
    expect(mockIssuesGet).toHaveBeenCalledWith({
      owner: "testOwner",
      repo: "testRepo",
      issue_number: 123,
    });
    expect(mockIssuesListComments).toHaveBeenCalledWith({
      owner: "testOwner",
      repo: "testRepo",
      issue_number: 123,
    });
  });

  it("should handle API errors gracefully", async () => {
    // mock
    const octokit = new Octokit();
    const mockIssuesGet = vi
      .spyOn(octokit.rest.issues, "get")
      .mockRejectedValueOnce(new Error("API Error"));

    const formData = new FormData();
    formData.append("owner", "testOwner");
    formData.append("repo", "testRepo");
    formData.append("issueNumber", "123");

    // call
    const result = await fetchCommentsAction({} as any, formData as any);

    // assert
    expect(result).toEqual({
      owner: "testOwner",
      repo: "testRepo",
      number: "123",
      body: "",
      comments: [],
      error: new Error("API Error"),
    });
    expect(mockIssuesGet).toHaveBeenCalledWith({
      owner: "testOwner",
      repo: "testRepo",
      issue_number: 123,
    });
  });

  it("should handle null issue body", async () => {
    // mock
    const octokit = new Octokit();
    const mockIssuesGet = vi
      .spyOn(octokit.rest.issues, "get")
      .mockResolvedValueOnce({
        data: {
          body: null,
        },
      } as any);
    const mockIssuesListComments = vi
      .spyOn(octokit.rest.issues, "listComments")
      .mockResolvedValueOnce({
        data: [
          {
            body: "This is a test comment",
          },
        ],
      } as any);

    const formData = new FormData();
    formData.append("owner", "testOwner");
    formData.append("repo", "testRepo");
    formData.append("issueNumber", "123");

    const expectedResult = {
      owner: "testOwner",
      repo: "testRepo",
      number: "123",
      body: "No description provided.",
      comments: ["This is a test comment"],
    };

    // call
    const result = await fetchCommentsAction({} as any, formData as any);

    // assert
    expect(result).toEqual(expectedResult);
    expect(mockIssuesGet).toHaveBeenCalledWith({
      owner: "testOwner",
      repo: "testRepo",
      issue_number: 123,
    });
    expect(mockIssuesListComments).toHaveBeenCalledWith({
      owner: "testOwner",
      repo: "testRepo",
      issue_number: 123,
    });
  });

  it("should handle empty comments list", async () => {
    // mock
    const octokit = new Octokit();
    const mockIssuesGet = vi
      .spyOn(octokit.rest.issues, "get")
      .mockResolvedValueOnce({
        data: {
          body: "This is a test issue body",
        },
      } as any);
    const mockIssuesListComments = vi
      .spyOn(octokit.rest.issues, "listComments")
      .mockResolvedValueOnce({
        data: [],
      } as any);

    const formData = new FormData();
    formData.append("owner", "testOwner");
    formData.append("repo", "testRepo");
    formData.append("issueNumber", "123");

    const expectedResult = {
      owner: "testOwner",
      repo: "testRepo",
      number: "123",
      body: "This is a test issue body",
      comments: [],
    };

    // call
    const result = await fetchCommentsAction({} as any, formData as any);

    // assert
    expect(result).toEqual(expectedResult);
    expect(mockIssuesListComments).toHaveBeenCalledWith({
      owner: "testOwner",
      repo: "testRepo",
      issue_number: 123,
    });
    expect(mockIssuesGet).toHaveBeenCalledWith({
      owner: "testOwner",
      repo: "testRepo",
      issue_number: 123,
    });
  });
});
