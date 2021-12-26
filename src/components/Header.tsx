import React, { ReactElement } from 'react';
import { Box, Drawer } from '@mui/material';

interface Props {
  
}

const filterWidth = 300;

export default function Header({ children }: any): ReactElement {
  return (
    <Box sx={{ display: "flex" }}>
      { children }
    </Box>
  )
}
