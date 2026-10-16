
import { useDispatch, useSelector } from "react-redux";
import { setTestUser, clearTestUser } from "../../features/auth/authSlice";

function DevAuthPanel() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  return (
    <div
      style={{
        marginTop: "24px",
        padding: "16px",
        border: "1px dashed #888",
        borderRadius: "8px",
      }}
    >
      <h3>Development Only: Test Authentication</h3>

      <p>
        Current user:{" "}
        {isAuthenticated ? `${user.role} (${user.name})` : "Not logged in"}
      </p>

      <button
        onClick={() =>
          dispatch(
            setTestUser({
              id: "test-author-1",
              name: "Test Author",
              role: "AUTHOR",
            })
          )
        }
      >
        Test as Author
      </button>

      <button
        style={{ marginLeft: "8px" }}
        onClick={() =>
          dispatch(
            setTestUser({
              id: "test-admin-1",
              name: "Test Admin",
              role: "ADMIN",
            })
          )
        }
      >
        Test as Admin
      </button>

      <button
        style={{ marginLeft: "8px" }}
        onClick={() => dispatch(clearTestUser())}
      >
        Log Out
      </button>
    </div>
  );
}

export default DevAuthPanel;
