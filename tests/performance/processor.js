module.exports = {
    generateNutriEmail: (req, context, ee, next) => {
        const email = `nutri_${Date.now()}_${Math.floor(Math.random() * 1000)}@test.com`;
        context.vars.nutriEmail = email;
        return next();
    },
    generatePatientEmail: (req, context, ee, next) => {
        const email = `patient_${Date.now()}_${Math.floor(Math.random() * 1000)}@test.com`;
        context.vars.patientEmail = email;
        return next();
    }
};
