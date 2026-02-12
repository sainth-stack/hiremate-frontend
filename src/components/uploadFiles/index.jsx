import React, { useState } from "react";
import { Box, Button, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "./index.scss";

const FileUploadCustom = ({
  label,
  title,
  buttonText,
  sx = {},
  onFileUpload,
  link = "",
  id,
  accept = ".jpg,.jpeg,.png,.pdf,.csv,.xls,.xlsx,.doc,.docx",
  allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".csv", ".xls", ".xlsx", ".doc", ".docx"],
  subtitle = "JPG, PNG, PDF, DOC, DOCX, CSV, Excel (Max 50MB)",
  maxSizeMB = 50,
}) => {
  const displayTitle = title ?? "Choose a file or drag & drop it here";
  const displayButtonText = buttonText ?? "Browse File";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension) || selectedFile.size > maxSizeMB * 1024 * 1024) {
      alert(`Invalid file. Please select valid file under ${maxSizeMB}MB.`);
      return;
    }

    setFile(selectedFile);

    // send file to parent
    if (onFileUpload) {
      onFileUpload(selectedFile);
    }
  };

  const handleDragOver = (event) => event.preventDefault();

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    handleFileChange({ target: { files: [droppedFile] } });
  };

  const handleBrowseClick = (event) => {
    event.stopPropagation();
    document.getElementById(id)?.click();
  };

  const handleBoxClick = () => {
    document.getElementById(id)?.click();
  };

  return (
    <Box>
      {label ? <label className="upload-label">{label}</label> : null}

      <Box
        className="upload-box"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBoxClick}
        sx={{
          border: isMobile ? "1.5px dashed var(--light-blue)" : "1px dashed var(--light-blue)",
          padding: isMobile ? "13px" : "20px",
          height: isMobile ? "180px" : "170px",
          ...sx,
        }}
      >
        <Box className="upload-content">
          <CloudUploadIcon sx={{ fontSize: 48, color: "var(--light-blue)", mb: 1 }} />

          <Box>
            <Typography className="upload-title">{displayTitle}</Typography>
            <Typography className="upload-subtitle">
              {subtitle}
            </Typography>
          </Box>
        </Box>

        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          id={id}
          style={{ display: "none" }}
        />

        <Button variant="outlined" onClick={handleBrowseClick} className="browse-btn" sx={{ borderColor: "var(--light-blue)", color: "var(--primary)", "&:hover": { borderColor: "var(--primary-light)", backgroundColor: "var(--light-blue-bg)" } }}>
          {displayButtonText}
        </Button>
      </Box>

      {file && (
        <Typography className="selected-file">
          Selected File: {file.name}
        </Typography>
      )}

      {link && (
        <Link href={link} target="_blank" className="upload-link">
          Click here
        </Link>
      )}
    </Box>
  );
};

export default FileUploadCustom;
