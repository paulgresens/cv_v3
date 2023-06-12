import {
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import { DatePickerInput, ImagePicker, Input } from "main/components";
import ExperienceCard from "main/components/experiene-card";
import SkillCard from "main/components/skill-card";
import { Experience, Skill } from "main/types";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import React, { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import uuid from "react-uuid";
import * as EmailValidator from "email-validator";
import { getLines } from "main/utils/functions";
import { postcodeValidator } from "postcode-validator";

type ResumeForm = {
  name: string;
  lastname: string;
  birthday: string;
  profile: string;
  street: string;
  postal_code: string;
  place: string;
  email: string;
  phone: string;
  experiences: Experience[];
  skills: Skill[];
};

const Home = () => {
  const methods = useForm<ResumeForm>();
  const { control, setValue, getValues, handleSubmit } = methods;
  const [pdfBytes, setPdfBytes] = useState<string>();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleDownloadPdf = () => {
    if (pdfBytes) {
      const a: HTMLAnchorElement = document.createElement("a");
      a.href = pdfBytes;
      a.download = `${getValues("name")} ${getValues("lastname")}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleGenerateResume = async (data: ResumeForm) => {
    setIsGenerating(true);
    const url = "template.pdf";
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();
    const page = pdfDoc.getPage(0);
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanFontBold = await pdfDoc.embedFont(
      StandardFonts.TimesRomanBold
    );

    let textWidth = 0;
    const { width, height } = page.getSize();
    const fontSize = 16;
    // 203
    const name = `${getValues("name")} ${getValues("lastname")}`;
    textWidth = timesRomanFont.widthOfTextAtSize(name, fontSize);
    page.drawText(name, {
      x: 210 / 2 - textWidth / 2,
      y: height - 3.5 * fontSize,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(1, 1, 1),
    });

    // place profile picture
    const profile_pic = getValues("profile");
    let xPosition = 0;
    let yPosition = 0;

    if (profile_pic && profile_pic?.length > 0) {
      let blob = await (await fetch(profile_pic)).blob();
      const base64data: string | ArrayBuffer = await new Promise(
        (resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result || "");
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }
      );

      if (base64data) {
        const img = await pdfDoc.embedPng(base64data);
        const imgWidth = img.width;
        const imgHeight = img.height;

        const targetWidth = 112;
        const targetHeight = 145;

        const imgRatio = imgWidth / imgHeight;
        const targetRatio = targetWidth / targetHeight;

        let newWidth: number, newHeight: number;

        if (imgRatio > targetRatio) {
          newWidth = targetHeight * imgRatio;
          newHeight = targetHeight;
        } else {
          newWidth = targetWidth;
          newHeight = targetWidth / imgRatio;
        }

        xPosition = 211 - newWidth;
        yPosition = height - 220 + (targetHeight - newHeight) / 2;

        page.drawImage(img, {
          x: xPosition,
          y: yPosition,
          width: newWidth,
          height: newHeight,
        });
      }
    }
    // place contact information
    const birthday = `Geburtsdatum: ${dayjs(getValues("birthday")).format(
      "DD.MM.YYYY"
    )}`;

    page.drawText(birthday, {
      x: 30,
      y: height - 250,
      size: fontSize - 4,
      font: timesRomanFont,
      color: rgb(1, 1, 1),
    });
    const street = `${getValues("street")}`;
    page.drawText(street, {
      x: 30,
      y: height - 290,
      size: fontSize - 3,
      font: timesRomanFont,
      color: rgb(1, 1, 1),
    });

    const place = `${getValues("postal_code")}, ${getValues("place")}`;
    page.drawText(place, {
      x: 29,
      y: height - 305,
      size: fontSize - 3,
      font: timesRomanFont,
      color: rgb(1, 1, 1),
    });
    const phone = `${getValues("phone")}`;
    page.drawText(phone, {
      x: 30,
      y: height - 345,
      size: fontSize - 3,
      font: timesRomanFont,
      color: rgb(1, 1, 1),
    });
    const email = `${getValues("email")}`;
    page.drawText(email, {
      x: 30,
      y: height - 360,
      size: fontSize - 3,
      font: timesRomanFont,
      color: rgb(1, 1, 1),
    });
    // place skills
    const skills = getValues("skills")?.filter(
      (s: Skill) => s.title.length > 0
    );
    if (skills.length > 0) {
      const text = "Kenntnisse";
      const x = 30;
      const y = height - 430;
      const padding = 5; // distance of underline from text

      page.drawText(text, {
        x: x,
        y: y,
        color: rgb(1, 1, 1),
        size: fontSize,
        font: timesRomanFont,
      });
      const textWidthSkill = timesRomanFont.widthOfTextAtSize(text, fontSize);

      page.drawLine({
        start: { x: x, y: y - padding },
        end: { x: x + textWidthSkill, y: y - padding },
        thickness: 1,
        color: rgb(1, 1, 1),
      });
    }
    let previousHeight = 0;
    skills.forEach((skill: Skill, i: number) => {
      const textArr: string[] = getLines(
        skill.title,
        68,
        70,
        fontSize,
        timesRomanFont
      );
      for (let l = 0; l < textArr.length; l++) {
        page.drawText(textArr[l], {
          x: 30,
          y: height - 460 - previousHeight,
          color: rgb(1, 1, 1),
          size: fontSize - 3,
          font: timesRomanFont,
        });
        if (l === 0) {
          for (let j = 5; j > 0; j--) {
            page.drawCircle({
              x: 200 - j * 16,
              y: height - 460 - previousHeight + 2,
              size: 6,
              borderWidth: 1,
              borderColor: rgb(0.97254902, 0.8627451, 0.47843137),
              color:
                j > 5 - skill.rating
                  ? rgb(0.97254902, 0.8627451, 0.47843137)
                  : undefined,
            });
          }
        }
        previousHeight += fontSize - 4;
      }

      previousHeight += 20;
    });
    // place experiences
    const experiences = getValues("experiences").filter(
      (exp: Experience) => exp.profession.length > 0
    );
    if (experiences.length > 0) {
      const expTitle = "Lebenslauf";
      const textWidthExp = timesRomanFont.widthOfTextAtSize(expTitle, fontSize);
      const xExp = (width + 210) / 2 - textWidthExp / 2;
      const yExp = height - 80;
      const paddingExp = 5; // distance of underline from text

      page.drawText(expTitle, {
        x: xExp,
        y: yExp,
        color: rgb(0, 0, 0),
        size: fontSize,
        font: timesRomanFont,
      });

      page.drawLine({
        start: { x: xExp, y: yExp - paddingExp },
        end: { x: xExp + textWidthExp, y: yExp - paddingExp },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
    }

    previousHeight = 0;
    experiences.forEach((exp: Experience, i: number) => {
      const date = `${dayjs(exp.startDate).format("MM/YYYY")} - ${dayjs(
        exp.endDate
      ).format("MM/YYYY")}`;
      textWidth = timesRomanFont.widthOfTextAtSize(date, fontSize - 3);
      const expTitleArr: string[] = getLines(
        `${exp.profession}, ${exp.position}`,
        106,
        108,
        fontSize - 3,
        timesRomanFont
      );
      page.drawText(date, {
        x: 240,
        y: height - previousHeight - 116,
        size: fontSize - 3,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      for (let l = 0; l < expTitleArr.length; l++) {
        page.drawText(expTitleArr[l], {
          x: 250 + textWidth,
          y: height - previousHeight - 116,
          color: rgb(0, 0, 0),
          size: fontSize - 3,
          font: timesRomanFontBold,
        });

        previousHeight += fontSize - 4;
      }
      const expDescArr: string[] = getLines(
        `${exp.desc}`,
        139,
        144,
        fontSize - 3,
        timesRomanFont
      );
      for (let l = 0; l < expDescArr.length; l++) {
        page.drawText(expDescArr[l], {
          x: 250 + textWidth,
          y: height - previousHeight - 120,
          color: rgb(0, 0, 0),
          size: fontSize - 3,
          font: timesRomanFont,
        });

        previousHeight += fontSize - 4;
      }
    });
    form.flatten();
    const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });
    setIsGenerating(false);
    setPdfBytes(pdfBytes);
  };
  const validateImage = async (value: string) => {
    if (!value) return true;
    let blob = await (await fetch(value)).blob();
    return blob.type === "image/png";
  };

  return (
    <Box p={{ xs: 5, lg: 15 }}>
      <FormProvider {...methods}>
        <Typography fontSize={30} mb={5}>
          Lebenslaufgenerator
        </Typography>
        <Grid
          container
          justifyContent={{ xs: "center", lg: "space-between" }}
          spacing={{ xs: 5, lg: 0 }}
        >
          <Grid item lg={7}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  control={control}
                  name="name"
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
                        label="Vorname"
                        value={value}
                        onChange={onChange}
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
                  name="lastname"
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
                        label="Nachname"
                        value={value}
                        onChange={onChange}
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
                  name="birthday"
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
                        label="Geburtstag"
                        value={value}
                        onChange={onChange}
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
                  name="street"
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
                        label="Straße und Hausnummer"
                        value={value}
                        onChange={onChange}
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
                  name="postal_code"
                  defaultValue=""
                  rules={{
                    required: "Benötigt",
                    validate: (value) =>
                      postcodeValidator(value, "DE") ||
                      "Ungültige Postleitzahl",
                  }}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { invalid, isTouched, isDirty, error },
                    formState,
                  }) => (
                    <>
                      <Input
                        label="Postleitzahl"
                        value={value}
                        onChange={onChange}
                        type="number"
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
                  name="place"
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
                      <Input label="Ort" value={value} onChange={onChange} />
                      {error && (
                        <Typography mt={1} color="red" fontSize={14}>
                          {error.message}
                        </Typography>
                      )}
                    </>
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            sx={{ display: { xs: "none", lg: "block" } }}
          />
          <Grid item xs={12} md={6} lg={4} xl={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="email"
                  defaultValue=""
                  rules={{
                    required: "Benötigt",
                    validate: (value) =>
                      EmailValidator.validate(value) || "Ungültige E-Mail",
                  }}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { invalid, isTouched, isDirty, error },
                    formState,
                  }) => (
                    <>
                      <Input label="Email" value={value} onChange={onChange} />
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
                  name="phone"
                  defaultValue=""
                  rules={{
                    required: "Benötigt",
                    pattern: {
                      value: /^(\+)?(\s*\d\s*){11}$/,
                      message: "Ungültige Telefonnummer",
                    },
                  }}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { invalid, isTouched, isDirty, error },
                    formState,
                  }) => (
                    <>
                      <Input
                        label="Telefonnummer"
                        value={value}
                        onChange={onChange}
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
                  name="profile"
                  rules={{
                    validate: async (value) =>
                      (await validateImage(value)) ||
                      "Aktuell wird nur das .png Format unterstützt",
                  }}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { invalid, isTouched, isDirty, error },
                    formState,
                  }) => (
                    <>
                      <ImagePicker value={value} onChange={onChange} />
                      {error && (
                        <Typography
                          mt={1}
                          color="red"
                          fontSize={14}
                          textAlign="center"
                        >
                          {error.message}
                        </Typography>
                      )}
                    </>
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider sx={{ my: 10 }} />
        <Grid
          container
          justifyContent={{ xs: "center", lg: "space-between" }}
          spacing={{ xs: 5, lg: 0 }}
        >
          <Grid item lg={7}>
            <Typography mb={4} fontSize={20}>
              Laufbahn
            </Typography>
            <Controller
              control={control}
              name="experiences"
              defaultValue={[
                {
                  id: uuid(),
                  startDate: undefined,
                  endDate: undefined,
                  profession: "",
                  position: "",
                  desc: "",
                },
              ]}
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, isTouched, isDirty, error },
                formState,
              }) => (
                <>
                  {value?.map((exp: Experience, index: number) => {
                    return (
                      <ExperienceCard
                        key={exp.id}
                        experience={exp}
                        onChangeExperience={(newExp: Experience) => {
                          onChange(
                            value.map((e: Experience) =>
                              e.id === newExp.id ? newExp : e
                            )
                          );
                        }}
                        onRemove={() =>
                          onChange(
                            value.filter((e: Experience) => e.id !== exp.id)
                          )
                        }
                      />
                    );
                  })}
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      display: "block",
                      mt: 4,
                      maxWidth: { xs: 400, lg: "100%" },
                      mx: "auto",
                    }}
                    onClick={() => {
                      onChange([
                        ...value,
                        {
                          id: uuid(),
                          startDate: undefined,
                          endDate: undefined,
                          profession: "",
                          position: "",
                          desc: "",
                        },
                      ]);
                    }}
                  >
                    Eintrag hinzufügen
                  </Button>
                </>
              )}
            />
          </Grid>
          <Grid item lg={4} xl={3}>
            <Typography mb={4} fontSize={20}>
              Weitere Kenntnisse
            </Typography>
            <Controller
              control={control}
              name="skills"
              defaultValue={[
                {
                  id: uuid(),
                  title: "",
                  rating: 1,
                },
              ]}
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { invalid, isTouched, isDirty, error },
                formState,
              }) => (
                <>
                  {value?.map((skill: Skill, index: number) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onChangeSkill={(newSkill: Skill) =>
                        onChange(
                          value.map((s: Skill) =>
                            s.id === newSkill.id ? newSkill : s
                          )
                        )
                      }
                      onRemove={() =>
                        onChange(value.filter((s: Skill) => s.id !== skill.id))
                      }
                    />
                  ))}

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      display: "block",
                      mt: 4,
                      maxWidth: { xs: 400, lg: "100%" },
                      mx: "auto",
                    }}
                    onClick={() => {
                      onChange([
                        ...value,
                        {
                          id: uuid(),
                          title: "",
                          rating: 1,
                        },
                      ]);
                    }}
                  >
                    Eintrag hinzufügen
                  </Button>
                </>
              )}
            />
          </Grid>
        </Grid>
        <Box
          mt={8}
          display="flex"
          flexDirection="row"
          gap={4}
          justifyContent="center"
        >
          <Button
            variant="contained"
            onClick={() => handleSubmit(handleGenerateResume)()}
            sx={{ minWidth: 260 }}
          >
            {isGenerating ? (
              <CircularProgress sx={{ color: "white" }} size={16} />
            ) : (
              "Lebenslauf generieren"
            )}
          </Button>
          <Button
            variant="outlined"
            onClick={handleDownloadPdf}
            disabled={!pdfBytes}
          >
            Download
          </Button>
        </Box>
        {pdfBytes && (
          <iframe
            src={pdfBytes}
            style={{ width: "100%", height: "100vh", marginTop: "2rem" }}
          ></iframe>
        )}
      </FormProvider>
    </Box>
  );
};
export default Home;
