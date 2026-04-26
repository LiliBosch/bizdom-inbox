<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConversationRequest;
use App\Http\Requests\UpdateConversationStatusRequest;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Repositories\ConversationRepository;
use App\Services\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ConversationController extends Controller
{
    public function __construct(
        private readonly ConversationRepository $repository,
        private readonly ConversationService $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $conversations = $this->repository->paginatedForUser($request->user(), [
            'search' => $request->query('search'),
            'unread' => $request->query('unread'),
            'per_page' => $request->integer('per_page', 10),
        ]);

        return ConversationResource::collection($conversations);
    }

    public function store(StoreConversationRequest $request): JsonResponse
    {
        $conversation = $this->service->createConversation($request->user(), $request->validated());

        return (new ConversationResource($conversation))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Conversation $conversation): ConversationResource
    {
        $conversation = $this->repository->findForUser($request->user(), $conversation);
        $this->service->markAsRead($conversation, $request->user());

        return new ConversationResource($conversation);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'unread_count' => $this->repository->unreadCountForUser($request->user()),
        ]);
    }

    public function updateStatus(UpdateConversationStatusRequest $request, Conversation $conversation): ConversationResource
    {
        $conversation = $this->repository->findForUser($request->user(), $conversation);
        $conversation = $this->service->updateStatus($conversation, $request->user(), $request->validated('status'));

        return new ConversationResource($conversation->loadMissing(['participants']));
    }
}
