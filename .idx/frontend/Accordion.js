import * as React from "react;
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummury from "@mui/materials/AccordionSummury";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";

const Accordion = styled((props => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({theme})) => ({
    border: '1px solid ${theme.palette.divider}',
    "&;not(:last-child)":{
        borderBottom: 0,

    },
    "&:before":{
        display: "none",
    },
}));
const AccordionSummary = styled((props) =>(
    <MuiAccordionSummary
)
    }
    }
})
)))

