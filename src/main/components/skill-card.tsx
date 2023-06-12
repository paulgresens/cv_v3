import { Box, IconButton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";
import Input from "./input";
import { Delete } from "@mui/icons-material";
import { Skill } from "main/types";

type SkillCardProps = {
  name?: string;
  onRemove: () => void;
  skill: Skill;
  onChangeSkill: (value: Skill) => void;
};

enum colors {
  "#ff0000",
  "#ffa700",
  "#fff400",
  "#a3ff00",
  "#2cba00",
}
const SkillCard = (props: SkillCardProps) => {
  const { name, onRemove, skill, onChangeSkill } = props;
  const [hover, setHover] = useState<number | undefined>();

  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    setInvalid(
      Object.keys(errors).filter((key: string) => key.includes(skill.id))
        .length > 0
    );
  }, [watch()]);
  return (
    <Box
      sx={{ border: `1px solid ${invalid ? "#ff0000" : "lightgray"}` }}
      p={3}
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
          top: 6,
          right: 13,
        }}
        onClick={onRemove}
      >
        <Delete />
      </IconButton>
      <Controller
        control={control}
        name={`title${skill.id}`}
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
              label="Kenntnisse"
              value={value}
              onChange={(newVal: string | null) => {
                onChange(newVal);
                onChangeSkill({ ...skill, title: newVal || "" });
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
      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          px: 4,
          height: 50,
          gap: 2,
        }}
        onMouseLeave={() => setHover(0)}
      >
        <Controller
          control={control}
          defaultValue={1}
          name={`rating${skill.id}`}
          render={({
            field: { onChange, onBlur, value, name, ref },
            fieldState: { invalid, isTouched, isDirty, error },
            formState,
          }) => (
            <>
              {[1, 2, 3, 4, 5].map((num: number) => {
                return (
                  <Box
                    key={num}
                    sx={{
                      display: "flex",
                      border: "1px solid",
                      borderColor: (hover ? num <= hover : num <= value)
                        ? colors[num - 1]
                        : "",
                      backgroundColor: (hover ? num <= hover : num <= value)
                        ? colors[num - 1]
                        : "",
                      height: 28,
                      width: 28,
                      borderRadius: "100%",
                      transition: "all 0.1s ease",
                      "&:hover": {
                        height: 33,
                        width: 33,
                        backgroundColor: colors[num - 1],
                        cursor: "pointer",
                      },
                    }}
                    onClick={() => {
                      onChange(num);
                      onChangeSkill({ ...skill, rating: num });
                    }}
                    onMouseEnter={() => setHover(num)}
                  />
                );
              })}
            </>
          )}
        />
      </Box>
    </Box>
  );
};
export default SkillCard;
