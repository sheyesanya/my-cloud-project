export default function UploadProofButton({
  onUpload
}) {

  const openWidget = () => {

    const widget =
      window.cloudinary.createUploadWidget(
        {
          cloudName: "dehap9dpe",

          uploadPreset:
            "brandcasta_uploads",

          multiple: false,

          resourceType: "auto",
        },

        (error, result) => {

          if (
            !error &&
            result &&
            result.event === "success"
          ) {

            onUpload(
              result.info.secure_url
            );
          }
        }
      );

    widget.open();
  };

  return (
    <button
      type="button"
      onClick={openWidget}
      className="btn-primary"
    >
      Upload Delivery Proof
    </button>
  );
}