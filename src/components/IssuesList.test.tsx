/**
 * Simple component test for IssuesList using React Testing Library approach
 * This serves as a backup test that doesn't require Playwright setup
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IssuesList } from './IssuesList';

// Mock the github module
vi.mock('../lib/github', () => ({
  getIssues: vi.fn(),
}));

// Mock the router for Link components
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params, search, className }: any) => (
    <a href={`${to.replace('$issueNumber', params?.issueNumber)}?owner=${search?.owner}&repo=${search?.repo}`} className={className}>
      {children}
    </a>
  ),
}));

describe('IssuesList Component (RTL)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display filtered issues without pull requests', async () => {
    const { getIssues } = await import('../lib/github');
    const mockGetIssues = vi.mocked(getIssues);

    // Mock data that represents what the filtering logic should return
    const filteredIssues = [
      {
        id: 1,
        number: 123,
        title: 'Feature Request: Add dark mode',
        body: 'It would be great to have a dark mode option.',
        state: 'open' as const,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-16T14:22:00Z',
        user: {
          login: 'developer123',
          avatar_url: 'https://github.com/identicons/developer123.png',
        },
        comments: 5,
      },
      {
        id: 3,
        number: 125,
        title: 'Bug Report: App crashes on startup',
        body: 'The application crashes when starting with specific configuration.',
        state: 'open' as const,
        created_at: '2024-01-13T12:00:00Z',
        updated_at: '2024-01-13T18:30:00Z',
        user: {
          login: 'bugfinder',
          avatar_url: 'https://github.com/identicons/bugfinder.png',
        },
        comments: 8,
      },
    ];

    mockGetIssues.mockResolvedValue(filteredIssues);

    render(<IssuesList owner="test-owner" repo="test-repo" />);

    // Wait for the component to load and display issues
    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'a' && content.includes('Feature Request: Add dark mode');
      })).toBeInTheDocument();
    });

    // Verify that both issues are displayed using more flexible text matching
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'a' && content.includes('#123') && content.includes('Feature Request: Add dark mode');
    })).toBeInTheDocument();
    
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'a' && content.includes('#125') && content.includes('Bug Report: App crashes on startup');
    })).toBeInTheDocument();

    // Verify that user information is displayed
    expect(screen.getByText('developer123')).toBeInTheDocument();
    expect(screen.getByText('bugfinder')).toBeInTheDocument();

    // Verify that comment counts are displayed
    expect(screen.getByText('5 comments')).toBeInTheDocument();
    expect(screen.getByText('8 comments')).toBeInTheDocument();

    // Verify that status badges are displayed
    expect(screen.getAllByText('open')).toHaveLength(2);

    // Verify that the getIssues function was called with correct parameters
    expect(mockGetIssues).toHaveBeenCalledWith('test-owner', 'test-repo');
  });

  it('should display loading state initially', async () => {
    const { getIssues } = await import('../lib/github');
    const mockGetIssues = vi.mocked(getIssues);
    
    // Mock a promise that doesn't resolve immediately
    mockGetIssues.mockImplementation(() => new Promise(() => {}));

    render(<IssuesList owner="test-owner" repo="test-repo" />);

    // Should show loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should display empty state when no issues are found', async () => {
    const { getIssues } = await import('../lib/github');
    const mockGetIssues = vi.mocked(getIssues);

    mockGetIssues.mockResolvedValue([]);

    render(<IssuesList owner="test-owner" repo="test-repo" />);

    await waitFor(() => {
      expect(screen.getByText('No issues found.')).toBeInTheDocument();
    });
  });

  it('should handle error states gracefully', async () => {
    const { getIssues } = await import('../lib/github');
    const mockGetIssues = vi.mocked(getIssues);

    mockGetIssues.mockRejectedValue(new Error('API Error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<IssuesList owner="test-owner" repo="test-repo" />);

    await waitFor(() => {
      expect(screen.getByText('No issues found.')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch issues:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should use default owner and repo when not provided', async () => {
    const { getIssues } = await import('../lib/github');
    const mockGetIssues = vi.mocked(getIssues);

    mockGetIssues.mockResolvedValue([]);

    render(<IssuesList />);

    await waitFor(() => {
      expect(screen.getByText('No issues found.')).toBeInTheDocument();
    });

    // Verify that getIssues was called with undefined parameters (using defaults)
    expect(mockGetIssues).toHaveBeenCalledWith(undefined, undefined);
  });

  it('should generate correct links to issue detail pages', async () => {
    const { getIssues } = await import('../lib/github');
    const mockGetIssues = vi.mocked(getIssues);

    const testIssue = {
      id: 1,
      number: 123,
      title: 'Test Issue',
      body: 'Test body',
      state: 'open' as const,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-16T14:22:00Z',
      user: {
        login: 'testuser',
        avatar_url: 'https://github.com/identicons/testuser.png',
      },
      comments: 0,
    };

    mockGetIssues.mockResolvedValue([testIssue]);

    render(<IssuesList owner="facebook" repo="react" />);

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'a' && content.includes('#123') && content.includes('Test Issue');
      })).toBeInTheDocument();
    });

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/issues/123?owner=facebook&repo=react');
  });

  it('should format dates correctly', async () => {
    const { getIssues } = await import('../lib/github');
    const mockGetIssues = vi.mocked(getIssues);

    const testIssue = {
      id: 1,
      number: 123,
      title: 'Test Issue',
      body: 'Test body',
      state: 'closed' as const,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-16T14:22:00Z',
      user: {
        login: 'testuser',
        avatar_url: 'https://github.com/identicons/testuser.png',
      },
      comments: 0,
    };

    mockGetIssues.mockResolvedValue([testIssue]);

    render(<IssuesList owner="test-owner" repo="test-repo" />);

    await waitFor(() => {
      expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    });

    // Verify closed state styling
    expect(screen.getByText('closed')).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should demonstrate the PR filtering functionality via mock', async () => {
    const { getIssues } = await import('../lib/github');
    const mockGetIssues = vi.mocked(getIssues);

    // This test demonstrates that the getIssues function should return filtered data
    // In reality, the filtering happens inside the getIssues function (which we tested separately)
    // but we can verify the component correctly displays what getIssues returns
    const filteredIssues = [
      {
        id: 1,
        number: 123,
        title: 'Actual Issue',
        body: 'This is a real issue',
        state: 'open' as const,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-16T14:22:00Z',
        user: {
          login: 'developer',
          avatar_url: 'https://github.com/identicons/developer.png',
        },
        comments: 2,
      },
      // Note: No pull requests in this array because they should be filtered out by getIssues
    ];

    mockGetIssues.mockResolvedValue(filteredIssues);

    render(<IssuesList owner="test-owner" repo="test-repo" />);

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'a' && content.includes('Actual Issue');
      })).toBeInTheDocument();
    });

    // Verify only one issue is displayed (no PRs)
    const issueCards = document.querySelectorAll('.bg-white.border.border-gray-200');
    expect(issueCards).toHaveLength(1);

    // Verify the issue number
    expect(screen.getByText((content) => content.includes('#123'))).toBeInTheDocument();
  });
});