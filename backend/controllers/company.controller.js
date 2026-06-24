

import { Company } from "../models/company.model.js";


export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({ message: "Company name is required.", success: false });
        }

        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({ message: "Company already exists.", success: false });
        }

        company = await Company.create({
            name: companyName,
            userId: req.id
        });

        return res.status(201).json({ message: "Company registered.", company, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};


export const getCompany = async (req, res) => {
    try {
        const userId = req.id;
        const companies = await Company.find({ userId });
        return res.status(200).json({ companies, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};


export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        return res.status(200).json({ companies, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: "Company not found.", success: false });
        }
        return res.status(200).json({ company, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};


export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const updateData = { name, description, website, location };

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!company) {
            return res.status(404).json({ message: "Company not found.", success: false });
        }
        return res.status(200).json({ message: "Company updated.", company, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
