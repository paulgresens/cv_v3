import { Box, Grid, IconButton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";
import DatePickerInput from "./datepicker";
import Input from "./input";
import { Delete } from "@mui/icons-material";
import { Experience } from "main/types";
import dayjs from "dayjs";

type ExperienceCardProps = {
  name?: string;
  onRemove: () => void;
  experience: Experience;
  onChangeExperience: (value: Experience) => void;
};

const ExperienceCard = (props: ExperienceCardProps) => {
  const { name, onRemove, experience, onChangeExperience } = props;
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    setInvalid(
      Object.keys(errors).filter((key: string) => key.includes(experience.id))
        .length > 0
    );
  }, [watch()]);
  return (
    <Box
      sx={{ border: `1px solid ${invalid ? "#ff0000" : "lightgray"}` }}
      p={4}
      pt={8}
      borderRadius={1}
      position="relative"
      boxShadow={1}
      my={4}
    >
      <IconButton
        color="error"
        sx={{
          position: "absolute",
          top: 15,
          right: 15,
        }}
        onClick={onRemove}
      >
        <Delete />
      </IconButton>
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <Controller
            control={control}
            name={`startDate${experience.id}`}
            rules={{
              required: "Benötigt",
            }}
            render={({
              field: { onChange, onBlur, value, name, ref },
              fieldState: { invalid, isTouched, isDirty, error },
              formState,
            }) => (
              <>
                <DatePickerInput
                  label="Startdatum"
                  value={value}
                  onChange={(newVal: any) => {
                    onChange(newVal);
                    onChangeExperience({ ...experience, startDate: newVal });
                  }}
                />
                {error && (
                  <Typography mt={1} color="red" fontSize={14}>
                    {error.message}
                  </Typography>
                )}
              </>
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            control={control}
            name={`endDate${experience.id}`}
            rules={{
              required: "Benötigt",
            }}
            render={({
              field: { onChange, onBlur, value, name, ref },
              fieldState: { invalid, isTouched, isDirty, error },
              formState,
            }) => (
              <>
                <DatePickerInput
                  label="Enddatum"
                  value={value}
                  maxValue={dayjs().format("DD.MM.YYYY")}
                  onChange={(newVal: any) => {
                    onChange(newVal);
                    onChangeExperience({ ...experience, endDate: newVal });
                  }}
                />
                {error && (
                  <Typography mt={1} color="red" fontSize={14}>
                    {error.message}
                  </Typography>
                )}
              </>
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            control={control}
            name={`profession${experience.id}`}
            defaultValue=""
            rules={{
              required: "Benötigt",
            }}
            render={({
              field: { onChange, onBlur, value, name, ref },
              fieldState: { invalid, isTouched, isDirty, error },
              formState,
            }) => (
              <>
                <Input
                  label="Beruf"
                  value={value}
                  onChange={(newVal: string | null) => {
                    onChange(newVal);
                    onChangeExperience({
                      ...experience,
                      profession: newVal || "",
                    });
                  }}
                />
                {error && (
                  <Typography mt={1} color="red" fontSize={14}>
                    {error.message}
                  </Typography>
                )}
              </>
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            control={control}
            name={`position${experience.id}`}
            defaultValue=""
            rules={{
              required: "Benötigt",
            }}
            render={({
              field: { onChange, onBlur, value, name, ref },
              fieldState: { invalid, isTouched, isDirty, error },
              formState,
            }) => (
              <>
                <Input
                  label="Position"
                  value={value}
                  onChange={(newVal: string | null) => {
                    onChange(newVal);
                    onChangeExperience({
                      ...experience,
                      position: newVal || "",
                    });
                  }}
                />
                {error && (
                  <Typography mt={1} color="red" fontSize={14}>
                    {error.message}
                  </Typography>
                )}
              </>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            control={control}
            name={`desc${experience.id}`}
            render={({
              field: { onChange, onBlur, value, name, ref },
              fieldState: { invalid, isTouched, isDirty, error },
              formState,
            }) => (
              <>
                <Input
                  label="Beschreibung"
                  value={value}
                  onChange={(newVal: string | null) => {
                    onChange(newVal);
                    onChangeExperience({ ...experience, desc: newVal || "" });
                  }}
                  multiline={true}
                />
              </>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
export default ExperienceCard;
