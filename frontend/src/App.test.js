import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLoginPage from "./AdminLoginPage";
import { adminLogin } from "./api";

const mockNavigate = jest.fn();

jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

jest.mock("./api", () => ({
  adminLogin: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test("logs in admin and redirects to dashboard", async () => {
  adminLogin.mockResolvedValue({
    success: true,
    data: {
      token: "sample-token",
      user: { role: "ADMIN", name: "Admin User" },
    },
  });

  const { container } = render(<AdminLoginPage />);

  await userEvent.type(container.querySelector('input[name="name"]'), " Admin User ");
  await userEvent.type(container.querySelector('input[name="password"]'), "secret123");
  await userEvent.click(screen.getByRole("button", { name: /login as admin/i }));

  await waitFor(() =>
    expect(adminLogin).toHaveBeenCalledWith({
      name: "Admin User",
      password: "secret123",
    })
  );

  expect(localStorage.getItem("token")).toBe("sample-token");
  expect(JSON.parse(localStorage.getItem("user"))).toEqual({
    role: "ADMIN",
    name: "Admin User",
  });
  expect(mockNavigate).toHaveBeenCalledWith("/AdminDashboard");
});

test("shows error when admin login fails", async () => {
  adminLogin.mockResolvedValue({
    success: false,
    message: "Invalid admin credentials",
  });

  const { container } = render(<AdminLoginPage />);

  await userEvent.type(container.querySelector('input[name="name"]'), "wrong-admin");
  await userEvent.type(container.querySelector('input[name="password"]'), "wrong-pass");
  await userEvent.click(screen.getByRole("button", { name: /login as admin/i }));

  expect(await screen.findByText(/invalid admin credentials/i)).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});
