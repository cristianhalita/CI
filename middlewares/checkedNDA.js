const NDA = require('../models/NDA');
const freelancers_NDA = require('../models/freelancers_NDA');
const lsps = require('../models/lsps');

module.exports = async (req, res, next) => {
    const {id: freelancerId, lspId} = req.session.user;

    try {
        const NDAS = await NDA.getAll();
        const freelancerNDAS = await freelancers_NDA.getAll(freelancerId);
        const lsp = await lsps.getById(lspId);

        const freelancerLength = freelancerNDAS.length;
        let ndaLength = 0;

        const subcontractorNDAs = NDAS.filter(value => {
            if (value.subcontractor) {
                return value;
            }
        });

        const normalNDAs = NDAS.filter(value => {
            if (!value.subcontractor) {
                return value;
            }
        });

        if (lsp) {
            ndaLength = subcontractorNDAs.length;
        }
        else  {
            ndaLength =  normalNDAs.length;
        }

        if (freelancerLength === ndaLength) {
            next();
        }
        else {
            let options = {
                title: "FL - Check new NDA's",
                errors: req.session.errors,
                firstName: req.session.user.firstName,
                lastName: req.session.user.lastName,
                freelancer: req.session.user
            };

            req.session.errors = [];

            let notCheckedNDAS = [];
            let freelancerNDASArray = freelancerNDAS.map((value) => {
                return value.NDAId
            });

            if (lsp) {
                for (let i = 0; i < subcontractorNDAs.length; i++) {
                    if (!freelancerNDASArray.includes(subcontractorNDAs[i].id)){
                        subcontractorNDAs[i].NDA = subcontractorNDAs[i].NDA.replace(/\{\{COMPANY NAME OF LSP}}/g, lsp.companyName);
                        notCheckedNDAS.push(subcontractorNDAs[i]);
                    }
                }
            }
            else {
                for (let i = 0; i < normalNDAs.length; i++) {
                    if (!freelancerNDASArray.includes(normalNDAs[i].id)){
                        notCheckedNDAS.push(normalNDAs[i]);
                    }
                }
            }


            options.NDA = notCheckedNDAS;
            res.render('checkNDA', options);
        }
    }
    catch (e) {
        console.log(e);
        req.session.errors.push("Failed to do a backend check to see if you checked all NDA's. Please report this to the developer.");
        next();
    }
};
