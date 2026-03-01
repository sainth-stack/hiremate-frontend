import { useDispatch, useSelector } from 'react-redux';
import { Box, MenuItem, Typography } from '@mui/material';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomSelect from '../../../components/inputs/CustomSelect';
import SectionCard from './SectionCard';
import { FORM_GRID_SX, SECTION_TITLE_SX } from '../constants';
import { setBasicInfo } from '../../../store/profile/profileSlice';

export default function LocationSection() {
  const dispatch = useDispatch();
  const form = useSelector((state) => state.profile?.form) || {};
  const city = form.city ?? '';
  const country = form.country ?? '';
  const willingToWorkIn = Array.isArray(form.willingToWorkIn) ? form.willingToWorkIn : [];

  return (
    <SectionCard>
      <Typography component="h3" sx={SECTION_TITLE_SX}>
        Current Location
      </Typography>
      <Box sx={FORM_GRID_SX}>
        <CustomInput
          label="City"
          value={city}
          onChange={(e) => dispatch(setBasicInfo({ city: e.target.value }))}
        />
        <CustomInput
          label="Country"
          value={country}
          onChange={(e) => dispatch(setBasicInfo({ country: e.target.value }))}
        />
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <CustomSelect
            label="Willing to Work In"
            multiple
            displayEmpty
            value={willingToWorkIn}
            onChange={(e) => dispatch(setBasicInfo({ willingToWorkIn: e.target.value ?? [] }))}
            renderValue={(v) => (v?.length ? v.join(', ') : 'Select countries')}
          >
            <MenuItem value="United States">United States</MenuItem>
            <MenuItem value="United Kingdom">United Kingdom</MenuItem>
            <MenuItem value="India">India</MenuItem>
            <MenuItem value="Canada">Canada</MenuItem>
            <MenuItem value="Germany">Germany</MenuItem>
          </CustomSelect>
        </Box>
      </Box>
    </SectionCard>
  );
}
