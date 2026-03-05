import { Request, Response, NextFunction } from 'express';
import { createRegistrationRequest } from "@/services/registration-request.service"

export const submitRegistrationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { 
    pharmacyName, 
    pharmacyEmail, 
    pharmacyAddress, 
    pharmacyPhone,
    nbPharmacien,
    nbPreparatoire,
    ownerLastName,
    ownerFirstName
  } = req.body;

  try {
    const registrationRequest = await createRegistrationRequest({
      pharmacyName,
      pharmacyEmail: pharmacyEmail.toLowerCase(),
      pharmacyAddress,
      pharmacyPhone,
      nbPharmacien: parseInt(nbPharmacien),
      nbPreparatoire: parseInt(nbPreparatoire),
      ownerLastName,
      ownerFirstName,
      status: 0, // pending
    });

    return res.customSuccess(
      200,
      'Registration request submitted successfully.',
      { request: registrationRequest },
      true
    );
  } catch (err) {
    console.error('Error creating registration request:', err);
    return res.customSuccess(
      200,
      'Error submitting registration request',
      {},
      false
    );
  }
};
