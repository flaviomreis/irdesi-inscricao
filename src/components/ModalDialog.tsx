type Props = {
  title: string;
  question: string;
  isVisible: boolean;
  closeDialog: () => void;
  handleConfirmAction: () => void;
};

export default function ModalDialog(props: Props) {
  function handleConfirmButton() {
    props.handleConfirmAction();
    props.closeDialog();
  }

  return (
    props.isVisible && (
      <div className="flex justify-center fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm">
        <div className="flex flex-col h-fit bg-white rounded-md  gap-4 border border-gray-400 shadow-lg">
          <div className="bg-blue-600 text-center rounded-md p-1 text-white font-semibold">
            {props.title}
          </div>
          <div className="flex flex-col px-8 gap-4">
            <div className="text-center">{props.question}</div>
            <div className="flex  gap-2 mb-2">
              <button
                onClick={() => props.closeDialog()}
                className="text-center w-32 p-2 rounded-md bg-purple-800 hover:bg-purple-600 text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmButton()}
                className="text-center w-32 p-2 rounded-md bg-red-600 hover:bg-red-800 text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
