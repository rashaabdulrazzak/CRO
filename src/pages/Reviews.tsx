import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Rating } from 'primereact/rating';
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";

type Review = {
    id: number;
    reviewer: string;
    comment: string;
    rating: number;
};

const initialReviews: Review[] = [
    { id: 1, reviewer: "Alice", comment: "Great product!", rating: 5 },
    { id: 2, reviewer: "Bob", comment: "Could be better.", rating: 3 },
    { id: 3, reviewer: "Charlie", comment: "Excellent support.", rating: 4 },
];

export default function Reviews() {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [form, setForm] = useState<Review>({
        id: 0,
        reviewer: "",
        comment: "",
        rating: 1,
    });

     const ratingBodyTemplate = (review: Review) => {
        return <Rating value={review.rating} readOnly cancel={false} />;
    };
    const openNew = () => {
        setForm({ id: Date.now(), reviewer: "", comment: "", rating: 1 });
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (review: Review) => {
        setForm(review);
        setIsEdit(true);
        setDialogVisible(true);
    };

    const saveReview = () => {
        if (isEdit) {
            setReviews(reviews.map(r => (r.id === form.id ? form : r)));
        } else {
            setReviews([...reviews, form]);
        }
        setDialogVisible(false);
        setForm({ id: 0, reviewer: "", comment: "", rating: 1 });
        console.log(selectedReview)
    };

    const deleteReview = (review: Review) => {
        setReviews(reviews.filter(r => r.id !== review.id));
    };

    const reviewDialogFooter = (
        <div>
            <Button label="Save" icon="pi pi-check" onClick={saveReview} className="p-button-sm save-btn mr-2" />
            <Button label="Cancel" icon="pi pi-times" onClick={() => setDialogVisible(false)} className="p-button-sm cancel-btn" />
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <Button label="Add Review" icon="pi pi-plus" onClick={openNew} className="p-button-sm p-button-primary add-btn" />
            </div>
            <DataTable value={reviews} selectionMode="single" onSelectionChange={e => setSelectedReview(e.value)} className="shadow rounded">
                <Column field="reviewer" header="Reviewer" />
                <Column field="comment" header="Comment" />
                <Column field="rating" header="Rating" body={ratingBodyTemplate} />
                <Column
                    header="Actions"
                    body={rowData => (
                        <div className="flex gap-2">
                            <Button icon="pi pi-pencil" className="p-button-sm  edit-btn" onClick={() => openEdit(rowData)} />
                            <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger" onClick={() => deleteReview(rowData)} />
                        </div>
                    )}
                />
            </DataTable>

            <Dialog header={isEdit ? "Edit Review" : "Add Review"} visible={dialogVisible} style={{ width: "30vw" }} footer={reviewDialogFooter} onHide={() => setDialogVisible(false)}>
                <div className="flex flex-col gap-4">
                    <span className="p-float-label">
                        <InputText id="reviewer" value={form.reviewer} onChange={e => setForm({ ...form, reviewer: e.target.value })} className="w-full" />
                        <label htmlFor="reviewer">Reviewer</label>
                    </span>
                    <span className="p-float-label">
                        <InputText id="comment" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} className="w-full" />
                        <label htmlFor="comment">Comment</label>
                    </span>
                    <span className="p-float-label">
                        <InputText
                            id="rating"
                            type="number"
                            min={1}
                            max={5}
                         //   value={form.rating}
                            onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
                            className="w-full"
                        />
                        <label htmlFor="rating">Rating (1-5)</label>
                    </span>
                </div>
            </Dialog>
        </div>
    );
}