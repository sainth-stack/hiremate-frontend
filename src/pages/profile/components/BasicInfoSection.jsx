import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import CustomInput from '../../../components/inputs/CustomInput';
import SectionCard from './SectionCard';
import { FORM_GRID_SX, SECTION_TITLE_SX } from '../constants';
import { setBasicInfo } from '../../../store/profile/profileSlice';

export default function BasicInfoSection() {
  const dispatch = useDispatch();
  const form = useSelector((state) => state.profile?.form) || {};
  const firstName = form.firstName ?? '';
  const lastName = form.lastName ?? '';
  const email = form.email ?? '';
  const phone = form.phone ?? '';

  return (
    <SectionCard>
      <Typography component="h3" sx={SECTION_TITLE_SX}>
        Basic Information
      </Typography>
      <Box sx={FORM_GRID_SX}>
        <CustomInput
          label="First Name"
          value={firstName}
          onChange={(e) => dispatch(setBasicInfo({ firstName: e.target.value }))}
        />
        <CustomInput
          label="Last Name"
          value={lastName}
          onChange={(e) => dispatch(setBasicInfo({ lastName: e.target.value }))}
        />
        <CustomInput
          label="Email"
          type="email"
          placeholder="john.doe@example.com"
          value={email}
          onChange={(e) => dispatch(setBasicInfo({ email: e.target.value }))}
        />
        <CustomInput
          label="Phone (with country code)"
          placeholder="+1 234 567 8900"
          value={phone}
          onChange={(e) => dispatch(setBasicInfo({ phone: e.target.value }))}
        />
      </Box>
    </SectionCard>
  );
}
