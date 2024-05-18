import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { uiSlice } from "../app/ui";
import Link from "./Link";
import { SignInButton } from "@clerk/nextjs";

export const LoginModal = () => {
  const isOpen = useAppSelector((state) => state.ui.session.loginModalOpen);
  const dispatch = useAppDispatch();

  function closeModal() {
    dispatch(uiSlice.actions.closeLoginModal());
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={closeModal}
          open={isOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="bg-black fixed inset-0 z-40 bg-opacity-40 dark:bg-black dark:bg-opacity-80" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="bg-white w-full max-w-xl transform overflow-hidden rounded p-6 text-left align-middle shadow transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-gray-900 text-lg font-medium leading-6"
                  >
                    CMU Courses
                  </Dialog.Title>
                  <div className="mt-1">
                    <p className="text-gray-400 text-sm">
                      CMU Courses is built and maintained by ScottyLabs. Find
                      out more about us{" "}
                      <Link href={"https://www.scottylabs.org"}>here</Link>.
                      Your feedback is appreciated.
                    </p>
                    <p className="text-gray-600 mt-3 text-sm">
                      You are currently logged out, so you can&apos;t access FCE
                      data.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="text-gray-500 rounded border px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={closeModal}
                    >
                      Continue without logging in
                    </button>
                    <button
                      type="button"
                      className="text-blue-900 bg-blue-50 inline-flex justify-center rounded border px-4 py-2 text-sm font-medium border-transparent hover:bg-blue-100"
                    >
                      <SignInButton />
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
