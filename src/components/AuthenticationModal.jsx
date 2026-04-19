import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { GOOGLE_IMAGE } from "../utils/constants";
import { useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useDispatch } from "react-redux";
import { signInWithGoogle } from "../utils/socialAuth";
import { auth } from "../utils/firebase";
import { validateSignIn, validateSignUp } from "../utils/validations";
import { addUser } from "../store/slices/userSlice";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  height: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 3,
  p: 4,
};
function AuthenticationModal({ isOpen, onClose }) {
  const [isSignIn, setIsSignIn] = useState(false);
  const [isError, setIsError] = useState(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isResponseError, setIsResponseError] = useState(null);

  // use ref hooks
  const email = useRef(null);
  const password = useRef(null);
  const name = useRef(null);

  // const navigate = useNavigate();
  const dispatch = useDispatch();

  // toggle beween signup and sign in form function
  function toggle() {
    setIsSignIn(!isSignIn);
    setIsError(null);
  }
  // Clear error for specific field when user types
  function handleInputChange(field) {
    if ((isError && isError.field === field) || isResponseError) {
      setIsError(null);
      setIsResponseError(null);
    }
  }

  // login function which check validations also
  function handleButtonClick() {
    const validationResult = isSignIn
      ? validateSignIn(email.current.value, password.current.value)
      : validateSignUp(
          email.current.value,
          password.current.value,
          name.current.value
        );
    setIsError(validationResult);
    if (validationResult) return;
    setIsApiLoading(true);
    if (isSignIn) {
      signInWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          onClose();
          // console.log(user);
        })
        .catch((error) => {
          // const errorCode = error.code;
          const errorMessage = error.message;
          setIsResponseError(errorMessage);
          // console.log("errorCode:", errorCode, "errorMessage:", errorMessage);
        })
        .finally(() => {
          setIsApiLoading(false);
        });
    } else {
      createUserWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then((userCredential) => {
          // Signed up
          // const user = userCredential.user;
          updateProfile(auth.currentUser, {
            displayName: name.current.value,
          })
            .then(() => {
              const { uid, displayName, email } = auth.currentUser;
              dispatch(
                addUser({ uid: uid, firstName: displayName, email: email })
              );
              onClose();
            })
            .catch((error) => {
              setIsResponseError(error.message);
            });

        })
        .catch((error) => {
          // const errorCode = error.code;
          const errorMessage = error.message;
          setIsResponseError(errorMessage);
        })
        .finally(() => {
          setIsApiLoading(false);
        });
    }
  }

  // Social Login Handler (Reusable for all providers)
  async function handleSocialLogin(provider) {
    setIsApiLoading(true);
    setIsResponseError(null);

    let result;
    switch (provider) {
      case "google":
        result = await signInWithGoogle();
        break;
      default:
        return;
    }

    if (result.success) {
      onClose();
    } else {
      setIsResponseError(result.error);
    }

    setIsApiLoading(false);
  }
  // reset or forget password api:
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  function resetPassword() {
    if (!email.current.value || !emailRegex.test(email.current.value)) {
      setIsResponseError("Empty or Invalid email");
    } else {
      sendPasswordResetEmail(auth, email.current.value)
        .then(() => {
          setIsResponseError(
            "Reset Password link have been sent to your email."
          );
        })
        .catch((error) => {
          // console.error("Error:", error);
          setIsResponseError(error);
        });
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <div className="w-full flex flex-col  justify-center px-10">
          <div className="flex items-center flex-col justify-center ">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-3 w-full"
            >
              <h1 className="text-[28px] sm:text-[30px] md:text-[32px] font-bold text-black text-left">
                {isSignIn ? "Sign In" : "Sign Up"}
              </h1>

              {/* name input for sign up form  */}
              {!isSignIn && (
                <input
                  ref={name}
                  type="text"
                  placeholder="Full Name"
                  onChange={() => handleInputChange("name")}
                  className="border border-[rgb(110,98,98)] mt-2 px-3 rounded  text-black placeholder-gray-400 w-full text-sm py-2"
                />
              )}
              {isError?.field === "name" && (
                <p className="text-red-500 text-[12px] flex items-center">
                  <i className="ri-close-circle-line px-1 text-lg"></i>
                  {isError.message}.
                </p>
              )}

              <input
                ref={email}
                type="text"
                placeholder="Enter email"
                onChange={() => handleInputChange("email")}
                className="border border-[rgb(110,98,98)] mt-2 px-3 rounded text-black placeholder-gray-400 w-full text-sm py-2"
              />
              {isError?.field === "email" && (
                <p className="text-red-500 text-[12px] flex items-center">
                  <i className="ri-close-circle-line px-1 text-lg"></i>
                  {isError.message}
                </p>
              )}

              <input
                ref={password}
                type="password"
                placeholder="Password"
                onChange={() => handleInputChange("password")}
                className="border border-[rgb(110,98,98)] mt-2 px-3 rounded text-black placeholder-gray-400 w-full text-sm py-2"
              />
              {isError?.field === "password" && (
                <p className="text-red-500 text-[12px] flex ">
                  <i className="ri-close-circle-line px-1 text-lg"></i>
                  {isError.message}
                </p>
              )}

              {isSignIn && (
                <p
                  onClick={resetPassword}
                  className="cursor-pointer underline text-black font-bold text-right text-[13px]"
                >
                  Forgot password?
                </p>
              )}

              <button
                onClick={handleButtonClick}
                disabled={isApiLoading}
                className="text-white cursor-pointer w-full bg-red-600 py-2 px-8 sm:px-12 font-bold rounded text-[15px] sm:text-[16px] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-red-600"
              >
                {isSignIn
                  ? isApiLoading
                    ? "Signing In..."
                    : "Sign In"
                  : isApiLoading
                  ? "Signing Up..."
                  : "Sign Up"}
              </button>
              {isResponseError && (
                <p className="text-red-500 text-[12px] flex items-center">
                  <i className="ri-close-circle-line px-1 text-lg sm:text-xl"></i>
                  {isResponseError}
                </p>
              )}
            </form>
            <p className="text-black text-center mt-3 text-[12px]">OR</p>
            <div className="grid w-full">
              <div
                onClick={() => handleSocialLogin("google")}
                className="border border-black py-1 px-3  rounded-md cursor-pointer my-2 hover:bg-gray-50 hover:-translate-y-1 transition duration-500 flex justify-center items-center"
                title="Continue with Google"
              >
                <img className="w-[26px] mr-4" src={GOOGLE_IMAGE} alt="" />
                <p className="text-[14px]">Continue with Google</p>
              </div>
            </div>
            <div className="flex gap-1 mt-2 text-sm flex-wrap justify-center">
              <p className="text-black]">
                {isSignIn ? "New to YouTube?" : "Already have an account?"}
              </p>
              <p
                onClick={() => toggle()}
                className="text-black font-bold cursor-pointer hover:underline"
              >
                {isSignIn ? "Sign Up." : "Sign In now."}
              </p>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}
export default AuthenticationModal;
