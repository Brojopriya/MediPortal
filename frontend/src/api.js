export async function fetchUsers() {
    const res = await fetch("http://localhost:5000/users");
    return await res.json();
  }
  