import * as React from "react";
import Box from "@mui/material/Box;
import Button from "@mui/material/Button";
import Typography from "@mui/material/Modal";
import Modal from "@mui/material/Modal";

const style = {
    poition: "absolute,
    top: "50%"
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "backgroound.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};
export default function BasicModal() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false); 
}
}