import mongoose, { Document, Model, Schema } from "mongoose";

export interface IViewedPhilosopher {
  philosopherId: string;
  slug: string;
  firstViewedAt: number;
  viewCount: number;
  lastViewedAt: number;
}

export interface ICompletedStep {
  pathSlug: string;
  stepIndex: number;
  completedAt: number;
}

export interface IUserProgress extends Document {
  userId: string;
  viewedPhilosophers: IViewedPhilosopher[];
  completedPathSteps: ICompletedStep[];
  completedPaths: { pathSlug: string; completedAt: number }[];
  stats: {
    totalPhilosophersViewed: number;
    totalPathsCompleted: number;
    streak: number;
    lastActiveAt: number;
  };
}

const ViewedPhilosopherSchema = new Schema<IViewedPhilosopher>(
  {
    philosopherId: { type: String, required: true },
    slug:          { type: String, required: true },
    firstViewedAt: { type: Number, required: true },
    viewCount:     { type: Number, default: 1 },
    lastViewedAt:  { type: Number, required: true },
  },
  { _id: false },
);

const CompletedStepSchema = new Schema<ICompletedStep>(
  {
    pathSlug:    { type: String, required: true },
    stepIndex:   { type: Number, required: true },
    completedAt: { type: Number, required: true },
  },
  { _id: false },
);

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId:             { type: String, required: true, unique: true },
    viewedPhilosophers: { type: [ViewedPhilosopherSchema], default: [] },
    completedPathSteps: { type: [CompletedStepSchema], default: [] },
    completedPaths:     { type: [{ pathSlug: String, completedAt: Number }], default: [] },
    stats: {
      type: {
        totalPhilosophersViewed: { type: Number, default: 0 },
        totalPathsCompleted:     { type: Number, default: 0 },
        streak:                  { type: Number, default: 0 },
        lastActiveAt:            { type: Number, default: 0 },
      },
      default: { totalPhilosophersViewed: 0, totalPathsCompleted: 0, streak: 0, lastActiveAt: 0 },
    },
  },
  { timestamps: false },
);

const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress ?? mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);

export default UserProgress;
