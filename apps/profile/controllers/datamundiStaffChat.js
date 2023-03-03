exports.get = async (req, res) => {
    let options = {
        title: "FL - Datamundi Staff Chat",
        errors: req.session.errors,
		warnings: req.session.warnings,
        successes: req.session.successes,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName
    };

    req.session.errors = []; req.session.warnings = [];
    req.session.successes = [];

    const {id: freelancerId} = req.session.user;

    options.freelancer = req.session.user;

    res.render("staffChat", options);
};
