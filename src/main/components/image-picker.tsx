import { Person } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import React, { ChangeEvent, useEffect, useRef } from "react";

type ImagePickerProps = {
  name?: string;
  value: string;
  onChange: (value: any) => void;
};
const ImagePicker = (props: ImagePickerProps) => {
  const { name, value, onChange } = props;
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const handlePickImage = () => {
    if (imageInputRef?.current) {
      imageInputRef.current.click();
    }
  };
  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    var input = e.target;
    if (input?.files && input.files[0]) {
      var imageUrl = URL.createObjectURL(input.files[0]);
      onChange(imageUrl);
      e.target.value = "";
    } else {
      onChange(undefined);
    }
  };
  return (
    <Box sx={{ width: "100%" }}>
      <Box visibility="hidden">
        <input
          accept="image/*"
          multiple
          id={`image-input-${name}`}
          type="file"
          ref={imageInputRef}
          onChange={handleChangeImage}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          border: value ? "none" : "1px dotted lightgray",
          height: 170,
          mx: 5,
        }}
      >
        {value ? (
          <img
            src={`${value}`}
            alt="Profile Picture"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <Person sx={{ color: "lightgray", fontSize: "2rem" }} />
        )}
      </Box>
      <Button
        variant="contained"
        sx={{ textTransform: "none", display: "block", mt: 3, mx: "auto" }}
        onClick={handlePickImage}
      >
        {!value ? "Bild auswählen" : " Bild ändern"}
      </Button>
    </Box>
  );
};
export default ImagePicker;
