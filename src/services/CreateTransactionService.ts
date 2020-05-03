import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Invalid transaction type.');
    }

    let categoryFind = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryFind) {
      categoryFind = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryFind);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryFind.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
