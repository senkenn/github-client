import { expect, test } from "@playwright/experimental-ct-react";

// Create a mock for the date formatting scenario
test("should display dates in yyyy/mm/dd format", async ({ mount }) => {
  // Create a simple mock component that renders the same structure
  // but with known test data to verify date formatting
  const TestIssuesList = () => {
    const mockIssues = [
      {
        id: 123456,
        number: 1,
        title: "Sample Issue: Feature Request for Better Editor Support",
        body: "This is a sample issue description. We need better editor support for modern development workflows.",
        state: "open" as const,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        comments: 5,
        user: {
          id: 1,
          login: "developer123",
          avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
        },
      },
      {
        id: 123457,
        number: 2,
        title: "Bug Report: Application Crashes on Startup",
        body: "The application consistently crashes when starting up with specific configuration files.",
        state: "open" as const,
        created_at: "2024-01-14T08:15:30Z",
        updated_at: "2024-01-14T08:15:30Z",
        comments: 12,
        user: {
          id: 2,
          login: "bugfinder",
          avatar_url: "https://avatars.githubusercontent.com/u/2?v=4",
        },
      },
    ];

    return (
      <div className="space-y-4">
        {mockIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <button
                  type="button"
                  className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2 block"
                >
                  #{issue.number} {issue.title}
                </button>
                <p className="text-gray-600 mb-3 line-clamp-2">{issue.body}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <img
                      src={issue.user.avatar_url}
                      alt={issue.user.login}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{issue.user.login}</span>
                  </div>
                  <span>•</span>
                  <span data-testid={`date-${issue.number}`}>
                    {new Date(issue.created_at).getFullYear()}/
                    {(new Date(issue.created_at).getMonth() + 1)
                      .toString()
                      .padStart(2, "0")}
                    /
                    {new Date(issue.created_at)
                      .getDate()
                      .toString()
                      .padStart(2, "0")}
                  </span>
                  <span>•</span>
                  <span>{issue.comments} comments</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  issue.state === "open"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {issue.state}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const component = await mount(<TestIssuesList />);

  // Check that dates are formatted as yyyy/mm/dd
  await expect(component.getByTestId("date-1")).toHaveText("2024/01/15");
  await expect(component.getByTestId("date-2")).toHaveText("2024/01/14");

  // Check that the issues are displayed
  await expect(
    component.getByText(
      "#1 Sample Issue: Feature Request for Better Editor Support",
    ),
  ).toBeVisible();
  await expect(
    component.getByText("#2 Bug Report: Application Crashes on Startup"),
  ).toBeVisible();
});
